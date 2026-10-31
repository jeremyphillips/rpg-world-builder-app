import { z } from 'zod'

import type { ContentValidationIntent } from '../lib/content-validation-intent'
import type { ContentValidationIssue } from '../lib/content-validation-issue'
import { isContentReferenceable } from '../lib/content-resolution-policy'
import type { Spell } from './body'

/** Canonical spell content id. System spells use `<rulesetId>:<slug>`; homebrew uses the Mongo id. */
export const spellReferenceSchema = z.string().min(1)

export type SpellReference = z.infer<typeof spellReferenceSchema>

export const SPELL_REFERENCE_ISSUE_CODE = {
  unknownSpell: 'unknown_spell',
  spellNotReferenceable: 'spell_not_referenceable',
  spellCatalogUnavailable: 'spell_catalog_unavailable',
} as const

/** Walks grant rows and recommendation lists for persisted spell references. */
export function collectAuthoredSpellReferences(
  body: unknown,
): Array<{ path: string; spellId: SpellReference }> {
  const refs: Array<{ path: string; spellId: SpellReference }> = []
  walkAuthoredSpellReferences(body, '', refs)
  return refs
}

function walkAuthoredSpellReferences(
  value: unknown,
  path: string,
  refs: Array<{ path: string; spellId: SpellReference }>,
) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walkAuthoredSpellReferences(item, path ? `${path}.${index}` : String(index), refs)
    })
    return
  }
  if (typeof value !== 'object' || value === null) return

  const record = value as Record<string, unknown>
  if (Array.isArray(record.spellIds)) {
    record.spellIds.forEach((spellId, index) => {
      if (typeof spellId !== 'string') return
      refs.push({ path: `${path}.spellIds.${index}`, spellId })
    })
  }
  if (Array.isArray(record.spells)) {
    record.spells.forEach((spell, index) => {
      if (!spell || typeof spell !== 'object') return
      const spellId = (spell as { spellId?: unknown }).spellId
      if (typeof spellId !== 'string') return
      refs.push({ path: `${path}.spells.${index}.spellId`, spellId })
    })
  }

  for (const [key, child] of Object.entries(record)) {
    if (key === 'spellIds') continue
    walkAuthoredSpellReferences(child, path ? `${path}.${key}` : key, refs)
  }
}

export function resolveSpellReference(
  ref: SpellReference,
  spellsById: ReadonlyMap<string, Spell>,
): Spell | undefined {
  return spellsById.get(ref)
}

export function collectSpellReferenceIssues(args: {
  refs: readonly { path: string; spellId: SpellReference }[]
  spellsById: ReadonlyMap<string, Spell>
  catalogStatus: 'ready' | 'unavailable'
  intent: ContentValidationIntent
}): ContentValidationIssue[] {
  if (args.catalogStatus === 'unavailable') {
    if (args.intent !== 'publish') return []
    return args.refs.map((ref) => ({
      path: ref.path,
      code: SPELL_REFERENCE_ISSUE_CODE.spellCatalogUnavailable,
      message: 'The spell catalog is unavailable, so this reference cannot be checked.',
    }))
  }

  const issues: ContentValidationIssue[] = []
  for (const ref of args.refs) {
    const spell = resolveSpellReference(ref.spellId, args.spellsById)
    if (!spell) {
      issues.push({
        path: ref.path,
        code: SPELL_REFERENCE_ISSUE_CODE.unknownSpell,
        message: 'Choose a spell from the catalog.',
      })
      continue
    }
    if (args.intent === 'publish' && !isContentReferenceable(spell)) {
      issues.push({
        path: ref.path,
        code: SPELL_REFERENCE_ISSUE_CODE.spellNotReferenceable,
        message: 'Draft spells cannot be referenced on published content.',
      })
    }
  }
  return issues
}
