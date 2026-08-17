import { isContentReferenceable, type ContentResolutionRow } from '@rpg/contracts'

/** Published catalog rows eligible for new world-graph and definition references. */
export function filterReferenceableCatalogRows<T extends ContentResolutionRow>(
  rows: readonly T[],
): T[] {
  return rows.filter(isContentReferenceable)
}
