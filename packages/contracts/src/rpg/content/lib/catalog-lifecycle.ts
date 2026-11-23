import type { ContentTypeKey } from '../../primitives/content/content-type-keys'
import { getContentTypeCapitalizedSentenceLabel } from '../../primitives/content/content-type-terms'

/**
 * Catalog lifecycle for reference **presentation** resolution.
 * Validation collectors use `ready | unavailable` only — do not collapse loading and error for UI.
 */
export type CatalogLoadState = 'loading' | 'error' | 'ready'

/** Dashboard catalog query states (`ContentFormCtx.*CatalogStatus`). */
export type AuthoringCatalogStatus = 'pending' | 'ready' | 'error'

export function mapAuthoringCatalogLoadState(status: AuthoringCatalogStatus): CatalogLoadState {
  switch (status) {
    case 'pending':
      return 'loading'
    case 'error':
      return 'error'
    case 'ready':
      return 'ready'
  }
}

/** True when catalog maps may establish not-found outcomes. */
export function isCatalogAuthoritativeForReferenceLookup(loadState: CatalogLoadState): boolean {
  return loadState === 'ready'
}

export type CatalogLifecycleUnresolvedReason = 'catalog-loading' | 'catalog-error'

/**
 * Maps lifecycle to the presentation reason used before per-reference lookup.
 * Returns undefined when lookup should proceed (`ready`).
 */
export function catalogLifecycleUnresolvedReason(
  loadState: CatalogLoadState,
): CatalogLifecycleUnresolvedReason | undefined {
  if (loadState === 'loading') return 'catalog-loading'
  if (loadState === 'error') return 'catalog-error'
  return undefined
}

export type CatalogLifecycleDisplayReason =
  | CatalogLifecycleUnresolvedReason
  | 'catalog-unavailable'
  | 'catalog-scope-mismatch'

/** Vocabulary-driven loading/error copy shared across catalog content types. */
export function catalogLifecycleDisplayMessage(
  contentType: ContentTypeKey,
  reason: CatalogLifecycleDisplayReason,
): string {
  switch (reason) {
    case 'catalog-loading':
      return `Loading ${getContentTypeCapitalizedSentenceLabel(contentType, { plural: true })}…`
    case 'catalog-error':
    case 'catalog-unavailable':
    case 'catalog-scope-mismatch':
      return `Could not load ${getContentTypeCapitalizedSentenceLabel(contentType)}.`
  }
}
