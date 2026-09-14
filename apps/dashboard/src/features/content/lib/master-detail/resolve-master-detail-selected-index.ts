/** Resolves a stable row id to its index in a master-detail list. */
export function resolveSelectedIndexById(
  items: readonly { id: string }[],
  selectedId: string | null,
): number | null {
  if (selectedId === null) return null
  const index = items.findIndex((item) => item.id === selectedId)
  return index === -1 ? null : index
}

/** Returns the stable row id at the given list index. */
export function selectIdAtIndex(
  items: readonly { id: string }[],
  index: number,
): string | undefined {
  return items[index]?.id
}
