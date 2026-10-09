import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { getTermSentenceForm, type VocabularyTerm } from './types'

/**
 * Ratchet for vocabulary copy drift.
 *
 * Flags production call sites that lowercase a title or pluralize a label with a
 * trailing "s". Search, slug, and email normalization are ignored. A shared word
 * such as "schools" is ignored unless the entire copy prop equals a mechanical
 * derivative of a term title that is not already that term's sentence form.
 *
 * The baseline is the current set of call sites. A new hit fails. Removing a hit
 * without deleting its baseline entry fails too.
 */

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '../../../../../')

const SCAN_ROOTS = ['apps/dashboard/src', 'packages/contracts/src', 'packages/ui/src'] as const

const COPY_PROP_PATTERN =
  /(?:\b(?:label|placeholder|title|ariaLabel|triggerAriaLabel|message|description|noResultsMessage|noItemsMessage|searchPlaceholder|addLabel|chooseTitle|shortcutLabel|valueActionAriaLabel|clearChipLabel)|aria-label)\s*[:=]\s*(['"`])([^'"`\n]*)\1/g

type DriftKind = 'label-member' | 'label-getter' | 'label-identifier' | 'naive-plural'

/** Existing production derivations. Shrink this list as call sites move to sentence forms. */
const COPY_DERIVATION_BASELINE = [
  '1 apps/dashboard/src/features/character/lib/choice-sets/selection-counter.lib.ts label-member',
  '1 apps/dashboard/src/features/character/lib/relationship/connection-role-catalog.ts label-member',
  '1 apps/dashboard/src/features/character/npc/lib/quick-npc/quick-npc-create-modal-setup.lib.ts label-identifier',
  '1 apps/dashboard/src/features/content/lib/duplication/duplicate-content-labels.ts label-getter',
  '1 apps/dashboard/src/features/content/lib/entity/surfaces/drawer/replacement/entity-replacement-field-labels.ts label-identifier',
  '2 apps/dashboard/src/features/content/lib/forms/grants/grant-template-registry.ts label-getter',
  '1 apps/dashboard/src/features/content/lib/forms/grants/proficiency/proficiency-grant-form-labels.ts label-getter',
  '2 apps/dashboard/src/features/content/lib/forms/preview/content-form-preview-copy.ts label-member',
  '1 apps/dashboard/src/features/content/locations/lib/building-organizations/building-organization-composition-presentation.lib.ts label-member',
  '1 apps/dashboard/src/features/content/locations/lib/connected-parties/location-connection-surface-copy.ts label-getter',
  '2 apps/dashboard/src/features/content/locations/lib/forms/location-classification-form-fields.ts label-identifier',
  '4 apps/dashboard/src/features/game-terms/routes/vocabulary-overview-content.tsx label-identifier',
  '2 apps/dashboard/src/features/game-terms/routes/vocabulary-term-detail-content.tsx label-identifier',
  '2 apps/dashboard/src/features/media/lib/media-role-confirm.lib.ts label-identifier',
  '1 apps/dashboard/src/lib/create-flow/create-composition-summary.tsx label-member',
  '2 apps/dashboard/src/lib/create-setup/setup-summary-row-models.tsx label-member',
  '1 packages/contracts/src/rpg/content/lib/equipment-compact-display.ts label-getter',
  '1 packages/contracts/src/rpg/content/lib/grants/equipment-grant.ts label-identifier',
  '1 packages/contracts/src/rpg/content/lib/relationship/organization-location-connection-location-occupancy.ts label-getter',
  '2 packages/contracts/src/rpg/content/spell/effects/format.ts label-getter',
  '1 packages/contracts/src/rpg/content/spell/format-spell-metadata-core.ts label-getter',
  '1 packages/contracts/src/rpg/content/spell/format-spell-metadata-core.ts label-identifier',
  '1 packages/contracts/src/rpg/content/spell/format-spell-metadata-core.ts naive-plural',
  '1 packages/contracts/src/rpg/runtime/character-builder/format-choice-step-copy.ts label-member',
  '2 packages/contracts/src/rpg/runtime/character-builder/messages/character-builder-messages.ts label-getter',
  '1 packages/contracts/src/rpg/vocab/damage/vocabulary.ts label-identifier',
  '2 packages/contracts/src/rpg/vocab/movement-mode.ts label-getter',
  '1 packages/contracts/src/rpg/vocab/types.ts label-identifier',
  '1 packages/contracts/src/rpg/vocab/weapon/compatibility.ts label-getter',
  '1 packages/ui/src/components/ui/combobox-field-parts.client.tsx label-identifier',
  '2 packages/ui/src/components/ui/data-table-filter-region.client.tsx label-identifier',
  '1 packages/ui/src/filters/active-filter-chips.client.tsx label-member',
] as const

function collectSourceFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectSourceFiles(fullPath))
      continue
    }
    if (!/\.tsx?$/.test(entry)) continue
    if (/\.(?:test|stories)\.tsx?$/.test(entry)) continue
    if (entry.endsWith('.d.ts')) continue
    files.push(fullPath)
  }
  return files
}

function stripComments(source: string): string {
  let out = ''
  let i = 0
  let quote: "'" | '"' | '`' | null = null
  while (i < source.length) {
    const char = source[i]!
    const next = source[i + 1]
    if (quote) {
      out += char
      if (char === '\\') {
        out += next ?? ''
        i += 2
        continue
      }
      if (char === quote) quote = null
      i += 1
      continue
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char
      out += char
      i += 1
      continue
    }
    if (char === '/' && next === '/') {
      const end = source.indexOf('\n', i)
      i = end === -1 ? source.length : end
      continue
    }
    if (char === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2)
      i = end === -1 ? source.length : end + 2
      out += ' '
      continue
    }
    out += char
    i += 1
  }
  return out
}

function matchingOpenParen(source: string, closeIndex: number): number | null {
  let depth = 0
  for (let i = closeIndex; i >= 0; i -= 1) {
    const char = source[i]
    if (char === ')') depth += 1
    else if (char === '(') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return null
}

function identifierBefore(source: string, index: number): string {
  let i = index - 1
  while (i >= 0 && /\s/.test(source[i]!)) i -= 1
  const end = i + 1
  while (i >= 0 && /[\w$]/.test(source[i]!)) i -= 1
  return source.slice(i + 1, end)
}

function callEnd(source: string, toLowerCaseIndex: number): number | null {
  const open = source.indexOf('(', toLowerCaseIndex)
  if (open === -1) return null
  let depth = 0
  for (let i = open; i < source.length; i += 1) {
    const char = source[i]
    if (char === '(') depth += 1
    else if (char === ')') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return null
}

function isSearchOrCompare(source: string, closeParen: number): boolean {
  let i = closeParen + 1
  while (i < source.length && /\s/.test(source[i]!)) i += 1
  const rest = source.slice(i, i + 24)
  return (
    /^\.(?:includes|startsWith|endsWith|indexOf|search|match)\(/.test(rest) ||
    /^(?:===|!==|==|!=)/.test(rest)
  )
}

function classifyToLowerCase(source: string, dotIndex: number): DriftKind | null {
  const close = callEnd(source, dotIndex + 1)
  if (close == null || isSearchOrCompare(source, close)) return null

  let i = dotIndex - 1
  while (i >= 0 && /\s/.test(source[i]!)) i -= 1
  if (source[i] === ')') {
    const open = matchingOpenParen(source, i)
    if (open == null) return null
    const name = identifierBefore(source, open)
    if (/^(?:get\w*Label|vocabularyTermLabel)$/.test(name)) return 'label-getter'
    return null
  }

  const end = i + 1
  while (i >= 0 && /[\w$]/.test(source[i]!)) i -= 1
  const name = source.slice(i + 1, end)
  if (name === 'label') {
    let j = i
    while (j >= 0 && /\s/.test(source[j]!)) j -= 1
    return source[j] === '.' ? 'label-member' : 'label-identifier'
  }
  if (/^[A-Za-z][\w$]*Label$/.test(name)) return 'label-identifier'
  return null
}

function expressionPluralizesLabel(expression: string): boolean {
  return /\blabel\b|\w*Label\b|get\w*Label\s*\(|vocabularyTermLabel\s*\(/.test(expression)
}

function findCopyDerivations(source: string): DriftKind[] {
  const stripped = stripComments(source)
  const kinds: DriftKind[] = []
  let index = 0
  while ((index = stripped.indexOf('toLowerCase(', index)) !== -1) {
    let dot = index - 1
    while (dot >= 0 && /\s/.test(stripped[dot]!)) dot -= 1
    if (stripped[dot] === '?') dot -= 1
    if (stripped[dot] === '.') {
      const kind = classifyToLowerCase(stripped, dot)
      if (kind) kinds.push(kind)
    }
    index += 'toLowerCase('.length
  }

  const plural = /\$\{([^{}]*)\}s\b/g
  for (const match of stripped.matchAll(plural)) {
    if (expressionPluralizesLabel(match[1] ?? '')) kinds.push('naive-plural')
  }
  return kinds
}

function naivePlural(lowered: string): string {
  return lowered.endsWith('s') ? lowered : `${lowered}s`
}

/** Mechanical leftovers of a title. Curated sentence forms and compact labels are omitted. */
function mechanicalTitleDerivatives(term: Pick<VocabularyTerm, 'label' | 'sentence'>): string[] {
  const entry = { description: '', ...term }
  const singular = getTermSentenceForm(entry, 1)
  const plural = getTermSentenceForm(entry, 2)
  const lowered = term.label.toLowerCase()
  const candidates = [lowered, naivePlural(lowered)]
  return [...new Set(candidates)].filter(
    (candidate) => candidate !== singular && candidate !== plural && candidate.length >= 8,
  )
}

function readTermObjects(source: string): Array<Pick<VocabularyTerm, 'label' | 'sentence'>> {
  const terms: Array<Pick<VocabularyTerm, 'label' | 'sentence'>> = []
  const declaration = /export const [A-Z0-9_]+_TERM = \{/g
  for (const match of source.matchAll(declaration)) {
    const open = (match.index ?? 0) + match[0].length - 1
    let depth = 0
    let end = open
    for (let i = open; i < source.length; i += 1) {
      const char = source[i]
      if (char === '{') depth += 1
      else if (char === '}') {
        depth -= 1
        if (depth === 0) {
          end = i
          break
        }
      }
    }
    const body = source.slice(open, end + 1)
    const label = /label:\s*'([^']*)'/.exec(body)?.[1]
    if (!label) continue
    const singular = /singular:\s*'([^']*)'/.exec(body)?.[1]
    const plural = /plural:\s*'([^']*)'/.exec(body)?.[1]
    terms.push({
      label,
      sentence: singular || plural ? { singular, plural } : undefined,
    })
  }
  return terms
}

function scanProductionDerivations(): string[] {
  const counts = new Map<string, number>()
  for (const root of SCAN_ROOTS) {
    for (const file of collectSourceFiles(join(repoRoot, root))) {
      const kinds = findCopyDerivations(readFileSync(file, 'utf8'))
      const relativePath = relative(repoRoot, file)
      for (const kind of kinds) {
        const key = `${relativePath} ${kind}`
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
  }
  return [...counts.entries()]
    .map(([key, count]) => `${count} ${key}`)
    .sort((a, b) => a.slice(a.indexOf(' ') + 1).localeCompare(b.slice(b.indexOf(' ') + 1)))
}

function scanMechanicalCopyProps(banned: ReadonlySet<string>): string[] {
  const hits: string[] = []
  for (const root of SCAN_ROOTS) {
    for (const file of collectSourceFiles(join(repoRoot, root))) {
      const source = stripComments(readFileSync(file, 'utf8'))
      for (const match of source.matchAll(COPY_PROP_PATTERN)) {
        const value = match[2] ?? ''
        if (!banned.has(value)) continue
        hits.push(`${relative(repoRoot, file)} ${value}`)
      }
    }
  }
  return hits.sort()
}

describe('vocabulary copy drift', () => {
  it('does not treat compact words or curated sentence forms as mechanical copies', () => {
    expect(
      mechanicalTitleDerivatives({
        label: 'School of Magic',
        sentence: { singular: 'school of magic', plural: 'schools of magic' },
      }),
    ).toEqual(['school of magics'])
    expect(
      mechanicalTitleDerivatives({
        label: 'Hit Points',
        sentence: { singular: 'hit point', plural: 'hit points' },
      }),
    ).toEqual([])
    expect(
      mechanicalTitleDerivatives({
        label: 'Proficiency',
        sentence: { singular: 'proficiency', plural: 'proficiencies' },
      }),
    ).toEqual(['proficiencys'])
  })

  it('ignores search normalization and flags title lowercasing', () => {
    expect(
      findCopyDerivations(
        'return options.filter((option) => option.label.toLowerCase().includes(query))',
      ),
    ).toEqual([])
    expect(findCopyDerivations('const aria = `Filter by ${schoolLabel.toLowerCase()}`')).toEqual([
      'label-identifier',
    ])
    expect(findCopyDerivations('return `Add ${choiceSet.label.toLowerCase()}`')).toEqual([
      'label-member',
    ])
    expect(findCopyDerivations('return `${getSpellSchoolLabel(id).toLowerCase()} spells`')).toEqual(
      ['label-getter'],
    )
    expect(findCopyDerivations('return `${count} ${unitLabel}s`')).toEqual(['naive-plural'])
    expect(findCopyDerivations('const noun = count === 1 ? name : `${name}s`')).toEqual([])
  })

  it('keeps production label derivations on the ratchet', () => {
    expect(scanProductionDerivations()).toEqual([...COPY_DERIVATION_BASELINE])
  })

  it('rejects copy props that are mechanical title leftovers', () => {
    const banned = new Set<string>()
    for (const root of SCAN_ROOTS) {
      for (const file of collectSourceFiles(join(repoRoot, root))) {
        if (!file.endsWith('.ts')) continue
        for (const term of readTermObjects(readFileSync(file, 'utf8'))) {
          for (const derivative of mechanicalTitleDerivatives(term)) banned.add(derivative)
        }
      }
    }
    expect(scanMechanicalCopyProps(banned)).toEqual([])
  })
})
