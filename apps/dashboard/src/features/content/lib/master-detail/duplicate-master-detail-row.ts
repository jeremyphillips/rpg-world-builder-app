/** Copies an embedded row into a new homebrew row with no seed provenance. */
export function duplicateMasterDetailRow(source: unknown): Record<string, unknown> | null {
  if (typeof source !== 'object' || source === null || Array.isArray(source)) return null
  const next: Record<string, unknown> = {
    ...(source as Record<string, unknown>),
    id: crypto.randomUUID(),
  }
  delete next.provenance
  return next
}
