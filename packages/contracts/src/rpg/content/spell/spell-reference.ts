import { z } from 'zod'

import type { ContentValidationIntent } from '../lib/content-validation-intent'
import type { ContentValidationIssue } from '../lib/content-validation-issue'
import {
  authoredSpellIdsEdge,
  CATALOG_REFERENCE_ISSUE_CODE,
  collectCatalogReferenceIssues,
} from '../lib/catalog-reference-issues'
import type { Spell } from './body'
import type { SpellCatalogContext, SpellReferenceUnresolvedReason } from './spell-catalog-context'
import {
  spellCatalogLifecycleUnresolvedReason,
  spellReferenceDisplayMessageForUnresolvedReason,
} from './spell-catalog-context'

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

export type SpellReferenceResolution =
  | { status: 'resolved'; spellId: SpellReference; spell: Spell }
  | {
      status: 'unresolved'
      spellId: SpellReference
      reason: SpellReferenceUnresolvedReason
    }

export function resolveSpellReferenceOutcome(
  spellId: SpellReference,
  catalog: SpellCatalogContext,
): SpellReferenceResolution {
  const lifecycleReason = spellCatalogLifecycleUnresolvedReason(catalog.loadState)
  if (lifecycleReason) {
    return { status: 'unresolved', spellId, reason: lifecycleReason }
  }

  const spell = resolveSpellReference(spellId, catalog.spellsById)
  if (spell) {
    return { status: 'resolved', spellId, spell }
  }

  return { status: 'unresolved', spellId, reason: 'unknown-spell' }
}

export function resolveSpellReferenceOutcomes(
  spellIds: readonly SpellReference[],
  catalog: SpellCatalogContext,
): SpellReferenceResolution[] {
  return spellIds.map((spellId) => resolveSpellReferenceOutcome(spellId, catalog))
}

export function presentSpellReferenceDisplayName(resolution: SpellReferenceResolution): string {
  if (resolution.status === 'resolved') {
    return resolution.spell.name
  }
  return spellReferenceDisplayMessageForUnresolvedReason(resolution.reason)
}

/**
 * Monster stat block / reaction paths that collapse catalog lifecycle to `ready | unavailable`
 * (validation-style). Unavailable skips per-id lookup and emits `catalog-unavailable`.
 */
export function resolveSpellReferenceOutcomeForCatalogStatus(
  spellId: SpellReference,
  args: {
    catalogStatus: 'ready' | 'unavailable'
    spellsById?: ReadonlyMap<string, Spell>
  },
): SpellReferenceResolution {
  if (args.catalogStatus === 'unavailable') {
    return { status: 'unresolved', spellId, reason: 'catalog-unavailable' }
  }
  return resolveSpellReferenceOutcome(spellId, {
    loadState: 'ready',
    spellsById: args.spellsById ?? new Map(),
  })
}

export function collectSpellReferenceIssues(args: {
  refs: readonly { path: string; spellId: SpellReference }[]
  spellsById: ReadonlyMap<string, Spell>
  catalogStatus: 'ready' | 'unavailable'
  intent: ContentValidationIntent
  unresolvedOverlayTargetKeys?: ReadonlySet<string>
}): ContentValidationIssue[] {
  return collectCatalogReferenceIssues({
    policy: authoredSpellIdsEdge.policy,
    intent: args.intent,
    catalogStatus: args.catalogStatus,
    refs: args.refs.map((ref) => ({ path: ref.path, key: ref.spellId })),
    resolve: (key) => resolveSpellReference(key, args.spellsById),
    unavailablePlacement: authoredSpellIdsEdge.unavailablePlacement,
    messages: authoredSpellIdsEdge.messages,
    unresolvedOverlayTargetKeys: args.unresolvedOverlayTargetKeys,
  })
}
