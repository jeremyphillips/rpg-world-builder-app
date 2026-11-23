import { getContentTypeCapitalizedSentenceLabel } from '../../primitives/content/content-type-terms'

import type { Spell } from './body'
import type { SpellReference } from './spell-reference'

/**
 * Authoritative catalog lifecycle for spell **presentation** resolution.
 * Validation uses `ready | unavailable` only; do not collapse loading and error for UI.
 */
export type SpellCatalogLoadState = 'loading' | 'error' | 'ready'

/** Dashboard `ContentFormCtx.spellCatalogStatus` and equivalent authoring query states. */
export type AuthoringSpellCatalogStatus = 'pending' | 'ready' | 'error'

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
  catalogLoading: `Loading ${getContentTypeCapitalizedSentenceLabel('spells', { plural: true })}…`,
  catalogError: `Could not load ${getContentTypeCapitalizedSentenceLabel('spells', { plural: true })}.`,
} as const

export function mapAuthoringSpellCatalogLoadState(
  status: AuthoringSpellCatalogStatus,
): SpellCatalogLoadState {
  switch (status) {
    case 'pending':
      return 'loading'
    case 'error':
      return 'error'
    case 'ready':
      return 'ready'
  }
}

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
export function isSpellCatalogAuthoritativeForReferenceLookup(
  loadState: SpellCatalogLoadState,
): boolean {
  return loadState === 'ready'
}

/**
 * Maps lifecycle to the presentation reason used before per-id lookup.
 * Returns undefined when lookup should proceed (`ready`).
 */
export function spellCatalogLifecycleUnresolvedReason(
  loadState: SpellCatalogLoadState,
): Exclude<SpellReferenceUnresolvedReason, 'unknown-spell' | 'catalog-unavailable'> | undefined {
  if (loadState === 'loading') return 'catalog-loading'
  if (loadState === 'error') return 'catalog-error'
  return undefined
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
