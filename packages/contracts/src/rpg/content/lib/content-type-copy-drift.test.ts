import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { CONTENT_TYPE_KEYS } from '../../primitives/content/content-type-keys'
import { getTermCollectionLabel } from '../../vocab/types'
import { CONTENT_TYPE_TERMS, getContentTypeSentenceForm } from './content-type-terms'

/**
 * Is centrally owned content-type copy being redefined in a copy-bearing location?
 *
 * Owns only each content type's singular label, collection label, and singular or
 * plural sentence form. Flags those exact literals on copy props, copy-named
 * consts, and direct returns from copy-named functions. A normal run never
 * writes the baseline. Refresh it with UPDATE_CONTENT_TYPE_COPY_BASELINE=1,
 * then review the diff before checking it in.
 */

const repoRoot = join(fileURLToPath(new URL('.', import.meta.url)), '../../../../../../')
const baselinePath = fileURLToPath(
  new URL('./content-type-copy-drift.baseline.json', import.meta.url),
)

const SCAN_ROOTS = ['apps/dashboard/src', 'packages/contracts/src', 'packages/ui/src'] as const

const COPY_PROP_NAMES = [
  'valueActionAriaLabel',
  'triggerAriaLabel',
  'noResultsMessage',
  'searchPlaceholder',
  'noItemsMessage',
  'clearChipLabel',
  'shortcutLabel',
  'aria-label',
  'placeholder',
  'description',
  'chooseTitle',
  'ariaLabel',
  'addLabel',
  'message',
  'title',
  'label',
] as const

const COPY_BINDING_NAME = /(?:Label|Title|Heading|Placeholder)$/i

const BLOCK_KEYWORDS = new Set([
  'if',
  'for',
  'while',
  'switch',
  'catch',
  'with',
  'do',
  'function',
  'else',
])

type BindingKind = 'property' | 'const' | 'return'

type CopyHit = {
  nearestSymbol?: string
  bindingKind: BindingKind
  bindingName: string
  literal: string
}

type CopySite = CopyHit & {
  file: string
  count: number
}

type CopyException = CopyHit & {
  file: string
  reason: string
}

type BaselineFile = {
  baseline: CopySite[]
  exceptions: CopyException[]
}

type LiteralAt = {
  value: string
  index: number
}

const CONST_BINDING =
  /(?:export\s+)?(?:const|let)\s+([A-Za-z_$][\w$]*)\s*(?::\s*[A-Za-z0-9_$.|&\s<>[\]]+)?=\s*(?:\(\s*)?$/

const ARROW_BINDING =
  /(?:export\s+)?(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^()\n]*\)|[A-Za-z_$][\w$]*)\s*=>\s*(?:\(\s*)?$/

const RETURN_BINDING = /\breturn\s*(?:\(\s*)?$/

function ownedContentTypeCopy(): Set<string> {
  const owned = new Set<string>()
  for (const key of CONTENT_TYPE_KEYS) {
    const term = CONTENT_TYPE_TERMS[key]
    owned.add(term.label)
    owned.add(getTermCollectionLabel(term))
    owned.add(getContentTypeSentenceForm(key, 1))
    owned.add(getContentTypeSentenceForm(key, 2))
  }
  return owned
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
      if (char === quote && quote !== '`') quote = null
      else if (char === '`' && quote === '`') quote = null
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

function blank(chars: string[], start: number, end: number) {
  for (let i = start; i < end; i += 1) chars[i] = ' '
}

function decodeEscape(char: string): string {
  if (char === 'n') return '\n'
  if (char === 'r') return '\r'
  if (char === 't') return '\t'
  return char
}

function readQuoted(
  source: string,
  start: number,
  quote: "'" | '"',
  limit: number,
): { end: number; value: string } | null {
  let value = ''
  let i = start + 1
  while (i < limit) {
    const char = source[i]!
    if (char === '\\') {
      value += decodeEscape(source[i + 1] ?? '')
      i += 2
      continue
    }
    if (char === quote) return { end: i + 1, value }
    if (char === '\n') return null
    value += char
    i += 1
  }
  return null
}

function scanCode(
  source: string,
  start: number,
  end: number,
  chars: string[],
  stopOnUnbracedClose: boolean,
): { literals: LiteralAt[]; end: number } {
  const literals: LiteralAt[] = []
  let i = start
  let depth = 0
  while (i < end) {
    const char = source[i]!
    if (char === "'" || char === '"') {
      const parsed = readQuoted(source, i, char, end)
      if (!parsed) {
        chars[i] = char
        i += 1
        continue
      }
      literals.push({ value: parsed.value, index: i })
      blank(chars, i, parsed.end)
      i = parsed.end
      continue
    }
    if (char === '`') {
      const parsed = readTemplate(source, i, end, chars)
      if (parsed.value != null) literals.push({ value: parsed.value, index: i })
      else literals.push(...parsed.literals)
      i = parsed.end
      continue
    }
    if (char === '{') depth += 1
    if (char === '}') {
      if (depth === 0 && stopOnUnbracedClose) return { literals, end: i }
      if (depth > 0) depth -= 1
    }
    chars[i] = char
    i += 1
  }
  return { literals, end: i }
}

function readTemplate(
  source: string,
  start: number,
  limit: number,
  chars: string[],
): { end: number; value: string | null; literals: LiteralAt[] } {
  let i = start + 1
  let plain = ''
  let hasExpression = false
  const inner: LiteralAt[] = []
  let staticStart = i
  while (i < limit) {
    const char = source[i]!
    if (char === '\\') {
      plain += decodeEscape(source[i + 1] ?? '')
      i += 2
      continue
    }
    if (char === '`') {
      blank(chars, staticStart, i)
      blank(chars, start, start + 1)
      blank(chars, i, i + 1)
      return { end: i + 1, value: hasExpression ? null : plain, literals: inner }
    }
    if (char === '$' && source[i + 1] === '{') {
      hasExpression = true
      blank(chars, staticStart, i)
      const expression = scanCode(source, i + 2, limit, chars, true)
      inner.push(...expression.literals)
      chars[i] = '$'
      chars[i + 1] = '{'
      chars[expression.end] = '}'
      i = expression.end + 1
      staticStart = i
      plain = ''
      continue
    }
    plain += char
    i += 1
  }
  return { end: limit, value: hasExpression ? null : plain, literals: inner }
}

function structuralLiterals(source: string): { structural: string; literals: LiteralAt[] } {
  const chars = [...source]
  const { literals } = scanCode(source, 0, source.length, chars, false)
  return { structural: chars.join(''), literals }
}

function skipWsBack(code: string, index: number): number {
  let i = index
  while (i >= 0 && /\s/.test(code[i]!)) i -= 1
  return i
}

function readIdentBack(code: string, end: number): { name: string; nameIndex: number } | null {
  if (end < 0 || !/[\w$]/.test(code[end]!)) return null
  let i = end
  while (i >= 0 && /[\w$]/.test(code[i]!)) i -= 1
  return { name: code.slice(i + 1, end + 1), nameIndex: i + 1 }
}

/** Enclosing `{` for a position inside the block. */
function enclosingOpenBrace(code: string, index: number): number | null {
  let depth = 0
  for (let i = index; i >= 0; i -= 1) {
    const char = code[i]
    if (char === '}') depth += 1
    else if (char === '{') {
      if (depth === 0) return i
      depth -= 1
    }
  }
  return null
}

/** Matching `(` when `closeIndex` is the `)`. */
function matchingOpenParen(code: string, closeIndex: number): number | null {
  let depth = 0
  for (let i = closeIndex; i >= 0; i -= 1) {
    const char = code[i]
    if (char === ')') depth += 1
    else if (char === '(') {
      depth -= 1
      if (depth === 0) return i
    }
  }
  return null
}

function skipGenericBack(code: string, index: number): number {
  if (code[index] !== '>') return index
  let depth = 0
  for (let i = index; i >= 0; i -= 1) {
    if (code[i] === '>') depth += 1
    else if (code[i] === '<') {
      depth -= 1
      if (depth === 0) return skipWsBack(code, i - 1)
    }
  }
  return index
}

function parameterCloseParen(code: string, before: number): number | null {
  if (before < 0) return null
  if (code[before] === ')') return before
  const windowStart = Math.max(0, before - 160)
  if (!code.slice(windowStart, before + 1).includes(':')) return null
  let depth = 0
  for (let i = before; i >= windowStart; i -= 1) {
    const char = code[i]!
    if (char === ')' && depth === 0) return i
    if (char === ')' || char === '>' || char === ']') depth += 1
    else if (char === '(' || char === '<' || char === '[') depth = Math.max(0, depth - 1)
  }
  return null
}

function arrowBindingName(
  code: string,
  equalsIndex: number,
): { name: string; nameIndex: number } | null {
  let i = skipWsBack(code, equalsIndex - 1)
  if (code[i] === ')') {
    const open = matchingOpenParen(code, i)
    if (open == null) return null
    i = skipWsBack(code, open - 1)
  } else {
    const ident = readIdentBack(code, i)
    if (!ident) return null
    i = skipWsBack(code, ident.nameIndex - 1)
  }
  if (code.slice(Math.max(0, i - 4), i + 1) === 'async') i = skipWsBack(code, i - 5)
  if (code[i] !== '=') return null
  return readIdentBack(code, skipWsBack(code, i - 1))
}

function functionNameBeforeBrace(
  code: string,
  brace: number,
): { name: string; nameIndex: number } | null {
  const before = skipWsBack(code, brace - 1)
  if (before >= 1 && code[before] === '>' && code[before - 1] === '=') {
    return arrowBindingName(code, before - 1)
  }
  const closeParen = parameterCloseParen(code, before)
  if (closeParen == null) return null
  const openParen = matchingOpenParen(code, closeParen)
  if (openParen == null) return null
  const nameEnd = skipGenericBack(code, skipWsBack(code, openParen - 1))
  return readIdentBack(code, nameEnd)
}

function enclosingFunction(
  structural: string,
  index: number,
): { name: string; nameIndex: number } | undefined {
  let cursor = index
  while (cursor >= 0) {
    const open = enclosingOpenBrace(structural, cursor)
    if (open == null) return undefined
    const named = functionNameBeforeBrace(structural, open)
    if (named && !BLOCK_KEYWORDS.has(named.name)) return named
    cursor = open - 1
  }
  return undefined
}

function matchAtEnd(before: string, pattern: RegExp): RegExpMatchArray | null {
  return pattern.exec(before.slice(Math.max(0, before.length - 240)))
}

function matchCopyProp(before: string): string | null {
  const tail = before.slice(Math.max(0, before.length - 240))
  for (const name of COPY_PROP_NAMES) {
    const escaped = name.replace('-', '\\-')
    if (new RegExp(`(?:^|[^\\w$])${escaped}\\s*[:=]\\s*(?:\\{\\s*)?$`).test(tail)) return name
  }
  return null
}

function nearestSymbolFor(
  structural: string,
  index: number,
  bindingKind: BindingKind,
  bindingName: string,
): string | undefined {
  const enclosing = enclosingFunction(structural, index)
  if (!enclosing) return undefined
  if (bindingKind === 'return' && bindingName === enclosing.name) {
    return enclosingFunction(structural, enclosing.nameIndex)?.name
  }
  if (bindingName === enclosing.name) return undefined
  return enclosing.name
}

function copyHit(
  bindingKind: BindingKind,
  bindingName: string,
  literal: string,
  nearestSymbol: string | undefined,
): CopyHit {
  return {
    bindingKind,
    bindingName,
    literal,
    ...(nearestSymbol ? { nearestSymbol } : {}),
  }
}

function classifyLiteral(structural: string, index: number, literal: string): CopyHit | null {
  const before = structural.slice(0, index)
  const arrow = matchAtEnd(before, ARROW_BINDING)
  if (arrow?.[1] && COPY_BINDING_NAME.test(arrow[1])) {
    return copyHit(
      'return',
      arrow[1],
      literal,
      nearestSymbolFor(structural, index, 'return', arrow[1]),
    )
  }
  const declared = matchAtEnd(before, CONST_BINDING)
  if (declared?.[1] && COPY_BINDING_NAME.test(declared[1])) {
    return copyHit(
      'const',
      declared[1],
      literal,
      nearestSymbolFor(structural, index, 'const', declared[1]),
    )
  }
  if (matchAtEnd(before, RETURN_BINDING)) {
    const enclosing = enclosingFunction(structural, index)
    if (enclosing && COPY_BINDING_NAME.test(enclosing.name)) {
      return copyHit(
        'return',
        enclosing.name,
        literal,
        enclosingFunction(structural, enclosing.nameIndex)?.name,
      )
    }
  }
  const prop = matchCopyProp(before)
  if (!prop) return null
  return copyHit('property', prop, literal, nearestSymbolFor(structural, index, 'property', prop))
}

function findOwnedContentTypeCopy(source: string, owned: ReadonlySet<string>): CopyHit[] {
  const stripped = stripComments(source)
  const { structural, literals } = structuralLiterals(stripped)
  const hits: CopyHit[] = []
  for (const literal of literals) {
    if (!owned.has(literal.value)) continue
    const hit = classifyLiteral(structural, literal.index, literal.value)
    if (hit) hits.push(hit)
  }
  return hits
}

function groupHits(file: string, hits: readonly CopyHit[]): CopySite[] {
  const counts = new Map<string, CopySite>()
  for (const hit of hits) {
    const site = { file, ...hit, count: 1 }
    const key = identityKey(site)
    const existing = counts.get(key)
    if (existing) existing.count += 1
    else counts.set(key, site)
  }
  return [...counts.values()]
}

function identityKey(site: { file: string } & CopyHit): string {
  return [
    site.file,
    site.nearestSymbol ?? '',
    site.bindingKind,
    site.bindingName,
    site.literal,
  ].join('\0')
}

function collectSourceFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (statSync(fullPath).isDirectory()) {
      files.push(...collectSourceFiles(fullPath))
      continue
    }
    if (
      !/\.tsx?$/.test(entry) ||
      /\.(?:test|stories)\.tsx?$/.test(entry) ||
      entry.endsWith('.d.ts')
    ) {
      continue
    }
    if (entry === 'content-type-terms.ts') continue
    files.push(fullPath)
  }
  return files
}

function scanProduction(owned: ReadonlySet<string>): CopySite[] {
  const sites: CopySite[] = []
  for (const root of SCAN_ROOTS) {
    for (const file of collectSourceFiles(join(repoRoot, root))) {
      const hits = findOwnedContentTypeCopy(readFileSync(file, 'utf8'), owned)
      sites.push(...groupHits(relative(repoRoot, file), hits))
    }
  }
  return sites.sort(compareSites)
}

function compareSites(a: CopySite, b: CopySite): number {
  return (
    a.file.localeCompare(b.file) ||
    (a.nearestSymbol ?? '').localeCompare(b.nearestSymbol ?? '') ||
    a.bindingKind.localeCompare(b.bindingKind) ||
    a.bindingName.localeCompare(b.bindingName) ||
    a.literal.localeCompare(b.literal)
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isBindingKind(value: unknown): value is BindingKind {
  return value === 'property' || value === 'const' || value === 'return'
}

function readHit(value: unknown): CopyHit & { file: string } {
  if (!isRecord(value) || typeof value.file !== 'string' || !isBindingKind(value.bindingKind)) {
    throw new Error('Invalid content-type copy site')
  }
  if (typeof value.bindingName !== 'string' || typeof value.literal !== 'string') {
    throw new Error('Invalid content-type copy site')
  }
  if (value.nearestSymbol !== undefined && typeof value.nearestSymbol !== 'string') {
    throw new Error('Invalid content-type copy site')
  }
  return {
    file: value.file,
    ...(typeof value.nearestSymbol === 'string' ? { nearestSymbol: value.nearestSymbol } : {}),
    bindingKind: value.bindingKind,
    bindingName: value.bindingName,
    literal: value.literal,
  }
}

function loadBaselineFile(): BaselineFile {
  const parsed: unknown = JSON.parse(readFileSync(baselinePath, 'utf8'))
  if (!isRecord(parsed) || !Array.isArray(parsed.baseline) || !Array.isArray(parsed.exceptions)) {
    throw new Error(
      'content-type-copy-drift.baseline.json must contain baseline and exceptions arrays',
    )
  }
  return {
    baseline: parsed.baseline.map((entry) => {
      const hit = readHit(entry)
      if (!isRecord(entry) || typeof entry.count !== 'number' || entry.count < 1) {
        throw new Error(`Baseline count must be a positive number for ${hit.file}`)
      }
      return { ...hit, count: entry.count }
    }),
    exceptions: parsed.exceptions.map((entry) => {
      const hit = readHit(entry)
      if (!isRecord(entry) || typeof entry.reason !== 'string' || entry.reason.trim() === '') {
        throw new Error(`Scoped exception for ${hit.file} ${hit.bindingName} requires a reason`)
      }
      return { ...hit, reason: entry.reason }
    }),
  }
}

function formatBinding(site: CopyHit): string {
  const where = site.nearestSymbol ? `${site.nearestSymbol} > ` : ''
  if (site.bindingKind === 'const') return `${where}const ${site.bindingName} = "${site.literal}"`
  if (site.bindingKind === 'return') return `${where}${site.bindingName}() → "${site.literal}"`
  return `${where}${site.bindingName}: "${site.literal}"`
}

function formatDrift(current: readonly CopySite[], recorded: BaselineFile): string {
  const exceptions = new Map(recorded.exceptions.map((site) => [identityKey(site), site]))
  const baseline = new Map(recorded.baseline.map((site) => [identityKey(site), site]))
  const present = new Map(current.map((site) => [identityKey(site), site]))
  const blocks: string[] = []
  let needsHelper = false

  for (const site of current) {
    if (exceptions.has(identityKey(site))) continue
    const previous = baseline.get(identityKey(site))
    if (!previous) {
      needsHelper = true
      blocks.push(
        formatIssue(
          site,
          `absent from the baseline\n\n"${site.literal}" is owned by CONTENT_TYPE_TERMS.`,
        ),
      )
      continue
    }
    if (site.count === previous.count) continue
    if (site.count > previous.count) needsHelper = true
    const followUp =
      site.count > previous.count
        ? `\n\n"${site.literal}" is owned by CONTENT_TYPE_TERMS.`
        : '\n  update this baseline entry'
    blocks.push(formatIssue(site, `count ${previous.count} → ${site.count}${followUp}`))
  }

  for (const site of recorded.baseline) {
    const next = present.get(identityKey(site))
    if (exceptions.has(identityKey(site))) {
      blocks.push(
        formatIssue(site, 'remove this baseline entry; the binding is a scoped exception'),
      )
      continue
    }
    if (!next || next.count === 0) {
      blocks.push(
        formatIssue(site, `baseline count ${site.count} → 0\n  delete this baseline entry`),
      )
    }
  }

  for (const exception of recorded.exceptions) {
    if (!present.has(identityKey(exception))) {
      blocks.push(
        formatIssue(
          exception,
          'this scoped exception does not match a current binding\n  delete it or update it to the current binding',
        ),
      )
    }
  }

  if (blocks.length === 0) return ''
  const lines = ['Content-type copy drift detected', '', ...blocks]
  if (needsHelper) {
    lines.push(
      'Use:',
      '- getContentTypeTerm(...)',
      '- getTermCollectionLabel(...)',
      '- getContentTypeSentenceForm(...)',
      '',
      'If this is not the RPG content type, add a scoped exception for this binding.',
    )
  }
  return lines.join('\n')
}

function formatIssue(site: CopyHit & { file: string }, detail: string): string {
  return `${site.file}\n  ${formatBinding(site)}\n  ${detail}\n`
}

function writeBaseline(current: readonly CopySite[], recorded: BaselineFile) {
  const exceptions = new Set(recorded.exceptions.map((site) => identityKey(site)))
  const baseline = current
    .filter((site) => !exceptions.has(identityKey(site)))
    .map((site) => ({
      file: site.file,
      ...(site.nearestSymbol ? { nearestSymbol: site.nearestSymbol } : {}),
      bindingKind: site.bindingKind,
      bindingName: site.bindingName,
      literal: site.literal,
      count: site.count,
    }))
  const next: BaselineFile = { baseline, exceptions: recorded.exceptions }
  writeFileSync(baselinePath, `${JSON.stringify(next, null, 2)}\n`)
}

describe('content type copy drift', () => {
  const owned = ownedContentTypeCopy()

  it('owns only singular labels, collection labels, and sentence forms', () => {
    const expected = new Set<string>()
    for (const key of CONTENT_TYPE_KEYS) {
      const term = CONTENT_TYPE_TERMS[key]
      expected.add(term.label)
      expected.add(getTermCollectionLabel(term))
      expected.add(getContentTypeSentenceForm(key, 1))
      expected.add(getContentTypeSentenceForm(key, 2))
      expect(owned.has(term.description)).toBe(false)
    }
    expect([...owned].sort()).toEqual([...expected].sort())
    expect(owned.has('Species')).toBe(true)
    expect(owned.has('Spells')).toBe(true)
    expect(owned.has('species')).toBe(true)
    expect(owned.has('spells')).toBe(true)
  })

  it('flags copy props, copy-named consts, and direct returns from copy-named functions', () => {
    const source = `
      export const field = { label: \`Spells\` }
      const SECTION_LABEL = \`Species\`
      function resolveSectionLabel() {
        return 'Spells'
      }
      const getSectionHeading = () => 'Species'
      placeholder: 'Search species'
      function unused() {
        return 'Spells'
      }
      const formatSectionHeading = () => {
        return 'Classes'
      }
    `
    expect(groupHits('fixture.tsx', findOwnedContentTypeCopy(source, owned))).toEqual([
      {
        file: 'fixture.tsx',
        bindingKind: 'property',
        bindingName: 'label',
        literal: 'Spells',
        count: 1,
      },
      {
        file: 'fixture.tsx',
        bindingKind: 'const',
        bindingName: 'SECTION_LABEL',
        literal: 'Species',
        count: 1,
      },
      {
        file: 'fixture.tsx',
        bindingKind: 'return',
        bindingName: 'resolveSectionLabel',
        literal: 'Spells',
        count: 1,
      },
      {
        file: 'fixture.tsx',
        bindingKind: 'return',
        bindingName: 'getSectionHeading',
        literal: 'Species',
        count: 1,
      },
      {
        file: 'fixture.tsx',
        bindingKind: 'return',
        bindingName: 'formatSectionHeading',
        literal: 'Classes',
        count: 1,
      },
    ])
  })

  it('counts a second binding in the same file and separates functions', () => {
    const source = `
      function resolveSpellPickerHeading() {
        return { label: 'Spells', title: 'Spells' }
      }
      function resolveSpeciesHeading() {
        return { label: 'Spells' }
      }
    `
    expect(groupHits('picker.tsx', findOwnedContentTypeCopy(source, owned))).toEqual([
      {
        file: 'picker.tsx',
        nearestSymbol: 'resolveSpellPickerHeading',
        bindingKind: 'property',
        bindingName: 'label',
        literal: 'Spells',
        count: 1,
      },
      {
        file: 'picker.tsx',
        nearestSymbol: 'resolveSpellPickerHeading',
        bindingKind: 'property',
        bindingName: 'title',
        literal: 'Spells',
        count: 1,
      },
      {
        file: 'picker.tsx',
        nearestSymbol: 'resolveSpeciesHeading',
        bindingKind: 'property',
        bindingName: 'label',
        literal: 'Spells',
        count: 1,
      },
    ])
    const repeated = `
      function resolveSpellPickerHeading() {
        const first = { label: 'Spells' }
        const second = { label: 'Spells' }
        return first ?? second
      }
    `
    expect(groupHits('picker.tsx', findOwnedContentTypeCopy(repeated, owned))).toEqual([
      {
        file: 'picker.tsx',
        nearestSymbol: 'resolveSpellPickerHeading',
        bindingKind: 'property',
        bindingName: 'label',
        literal: 'Spells',
        count: 2,
      },
    ])
  })

  it('ignores longer sentences, helper arguments, jsx text, and interpolated templates', () => {
    const source = `
      const placeholder = 'Search species'
      function resolveSectionLabel() {
        return getContentTypeTerm('spells').label
      }
      const heading = <Heading>Spells</Heading>
      const button = <Button>Classes</Button>
      label: \`Search \${'species'}\`
      // label: 'Spells'
    `
    expect(findOwnedContentTypeCopy(source, owned)).toEqual([])
  })

  it('reports a count increase, a new binding, and a removed baseline entry', () => {
    const current: CopySite[] = [
      {
        file: 'apps/picker.tsx',
        nearestSymbol: 'resolveSpellPickerHeading',
        bindingKind: 'property',
        bindingName: 'label',
        literal: 'Spells',
        count: 2,
      },
    ]
    const recorded: BaselineFile = {
      baseline: [
        {
          file: 'apps/picker.tsx',
          nearestSymbol: 'resolveSpellPickerHeading',
          bindingKind: 'property',
          bindingName: 'label',
          literal: 'Spells',
          count: 1,
        },
        {
          file: 'apps/old.tsx',
          bindingKind: 'const',
          bindingName: 'SECTION_LABEL',
          literal: 'Species',
          count: 1,
        },
      ],
      exceptions: [],
    }
    const report = formatDrift(current, recorded)
    expect(report).toContain('Content-type copy drift detected')
    expect(report).toContain('resolveSpellPickerHeading > label: "Spells"')
    expect(report).toContain('count 1 → 2')
    expect(report).toContain('"Spells" is owned by CONTENT_TYPE_TERMS.')
    expect(report).toContain('const SECTION_LABEL = "Species"')
    expect(report).toContain('baseline count 1 → 0')
    expect(report).toContain('delete this baseline entry')
    expect(report).toContain('getContentTypeTerm(...)')
    expect(report).toContain('getTermCollectionLabel(...)')
    expect(report).toContain('getContentTypeSentenceForm(...)')
    expect(report).toContain('add a scoped exception for this binding')
  })

  it('keeps production owned copy on the count-sensitive ratchet', () => {
    const scannedFiles = SCAN_ROOTS.flatMap((root) => collectSourceFiles(join(repoRoot, root)))
    expect(scannedFiles.length).toBeGreaterThan(100)
    expect(
      scannedFiles.some((file) =>
        file.endsWith(`${join('content', 'lib', 'content-type-terms.ts')}`),
      ),
    ).toBe(false)

    const current = scanProduction(owned)
    const recorded = loadBaselineFile()
    const report = formatDrift(current, recorded)
    if (process.env.UPDATE_CONTENT_TYPE_COPY_BASELINE === '1') {
      writeBaseline(current, recorded)
      if (report) {
        throw new Error(
          `Wrote content-type-copy-drift.baseline.json. Review the diff and rerun without UPDATE_CONTENT_TYPE_COPY_BASELINE.\n\n${report}`,
        )
      }
    }
    expect(report).toBe('')
  })
})
