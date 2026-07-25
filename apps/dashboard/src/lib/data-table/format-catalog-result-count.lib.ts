/** Formats a simple filtered-row count for catalog overview utility strips. */
export function formatCatalogResultCount(filteredCount: number): string {
  return filteredCount === 1 ? '1 result' : `${filteredCount} results`
}
