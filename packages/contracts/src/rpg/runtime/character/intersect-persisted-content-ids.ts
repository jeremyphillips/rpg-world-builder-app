/** Minimal row shape for persisted-id intersection. */
export type PersistedContentIdRow = {
  readonly id: string
}

/**
 * Retains persisted affinity ids that appear in eligible rows, preserving authored order.
 * Walks `persistedIds` — does not reorder by catalog row sequence.
 */
export function intersectPersistedContentIds(
  persistedIds: readonly string[],
  eligibleRows: readonly PersistedContentIdRow[],
): string[] {
  const eligibleIds = new Set(eligibleRows.map((row) => row.id))
  return persistedIds.filter((id) => eligibleIds.has(id))
}
