import {
  catalogLifecycleDisplayMessage,
  catalogLifecycleUnresolvedReason,
  isCatalogAuthoritativeForReferenceLookup,
  mapAuthoringCatalogLoadState,
  type AuthoringCatalogStatus,
  type CatalogLoadState,
} from '../lib/catalog-lifecycle'
import type { Spell } from './body'
import type { SpellReference } from './spell-reference'

export type SpellCatalogLoadState = CatalogLoadState

/** Dashboard `ContentFormCtx.spellCatalogStatus` and equivalent authoring query states. */
export type AuthoringSpellCatalogStatus = AuthoringCatalogStatus

/**
 * Bundle passed to spell reference outcome resolution (Phase B).
 * `spellsById` is consulted only when `loadState === 'ready'`.
 */
export type SpellCatalogContext = {
  loadState: SpellCatalogLoadState
  spellsById: ReadonlyMap<string, Spell>
}

/**
 * Semantic resolution reasons for spell references.
 * `unknown-spell` is only valid when the catalog `loadState` is `ready`.
 */
export type SpellReferenceUnresolvedReason =
  | 'catalog-loading'
  | 'catalog-error'
  /** Validation pipeline (`collectSpellReferenceIssues`) when catalog cannot be checked. */
  | 'catalog-unavailable'
  /** Exact id missing from an authoritative ready catalog — not a slug/local alternate. */
  | 'unknown-spell'

export const SPELL_REFERENCE_DISPLAY_MESSAGES = {
  unknownSpell: 'Spell reference unavailable',
  catalogLoading: catalogLifecycleDisplayMessage('spells', 'catalog-loading'),
  catalogError: catalogLifecycleDisplayMessage('spells', 'catalog-error'),
} as const

export const mapAuthoringSpellCatalogLoadState = mapAuthoringCatalogLoadState

export function createSpellCatalogContext(args: {
  status: AuthoringSpellCatalogStatus
  spellsById?: ReadonlyMap<string, Spell>
}): SpellCatalogContext {
  return {
    loadState: mapAuthoringSpellCatalogLoadState(args.status),
    spellsById: args.spellsById ?? new Map(),
  }
}

/** True when `spellsById.get(ref)` may establish not-found (`unknown-spell`). */
export const isSpellCatalogAuthoritativeForReferenceLookup =
  isCatalogAuthoritativeForReferenceLookup

/**
 * Maps lifecycle to the presentation reason used before per-id lookup.
 * Returns undefined when lookup should proceed (`ready`).
 */
export function spellCatalogLifecycleUnresolvedReason(
  loadState: SpellCatalogLoadState,
): Exclude<SpellReferenceUnresolvedReason, 'unknown-spell' | 'catalog-unavailable'> | undefined {
  return catalogLifecycleUnresolvedReason(loadState)
}

export function spellReferenceDisplayMessageForUnresolvedReason(
  reason: SpellReferenceUnresolvedReason,
): string {
  switch (reason) {
    case 'unknown-spell':
      return SPELL_REFERENCE_DISPLAY_MESSAGES.unknownSpell
    case 'catalog-loading':
      return SPELL_REFERENCE_DISPLAY_MESSAGES.catalogLoading
    case 'catalog-error':
    case 'catalog-unavailable':
      return SPELL_REFERENCE_DISPLAY_MESSAGES.catalogError
  }
}

/** Preserves opaque persisted ids through resolution; no normalization. */
export type SpellReferenceIdentity = SpellReference
