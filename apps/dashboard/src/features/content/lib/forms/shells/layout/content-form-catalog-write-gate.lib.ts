/** Catalog query state shared by content form option hooks and write gates. */
export type ContentFormCatalogStatus = 'pending' | 'ready' | 'error'

/**
 * Blocks strict saves (publish / published update) while a required catalog cannot
 * be validated. Draft saves stay enabled — server rules still apply on persist.
 */
export function resolveStrictCatalogWriteGateReason(
  status: ContentFormCatalogStatus | undefined,
  copy: { loading: string; error: string },
): string | null {
  if (status === 'pending') return copy.loading
  if (status === 'error') return copy.error
  return null
}
