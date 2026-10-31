import { z } from 'zod'

import type { ContentValidationIntent } from '../lib/content-validation-intent'
import type { ContentValidationIssue } from '../lib/content-validation-issue'
import {
  authoredSpellIdsEdge,
  CATALOG_REFERENCE_ISSUE_CODE,
  collectCatalogReferenceIssues,
} from '../lib/catalog-reference-issues'
import type { Spell } from './body'

/** Canonical spell content id. System spells use `<rulesetId>:<slug>`; homebrew uses the Mongo id. */
export const spellReferenceSchema = z.string().min(1)

export type SpellReference = z.infer<typeof spellReferenceSchema>

export const SPELL_REFERENCE_ISSUE_CODE = {
  unknownSpell: CATALOG_REFERENCE_ISSUE_CODE.spell.unknown,
  spellNotReferenceable: CATALOG_REFERENCE_ISSUE_CODE.spell.notReferenceable,
  spellCatalogUnavailable: CATALOG_REFERENCE_ISSUE_CODE.spell.catalogUnavailable,
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
  return collectCatalogReferenceIssues({
    policy: authoredSpellIdsEdge.policy,
    intent: args.intent,
    catalogStatus: args.catalogStatus,
    refs: args.refs.map((ref) => ({ path: ref.path, key: ref.spellId })),
    resolve: (key) => resolveSpellReference(key, args.spellsById),
    unavailablePlacement: authoredSpellIdsEdge.unavailablePlacement,
    messages: authoredSpellIdsEdge.messages,
  })
}
