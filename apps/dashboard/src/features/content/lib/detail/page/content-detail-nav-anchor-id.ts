/** Stable in-page anchor id for a item inside a catalog detail section panel. */
export function contentDetailNavItemId(prefix: string, itemId: string): string {
  return `${prefix}-${itemId}`
}
