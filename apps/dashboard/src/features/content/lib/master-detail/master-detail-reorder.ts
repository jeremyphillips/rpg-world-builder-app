/** Adjusts the tracked selection after `useFieldArray().move(from, to)`. */
export function resolveSelectedIndexAfterMove(
  current: number | null,
  from: number,
  to: number,
): number | null {
  if (current === null) return null
  if (current === from) return to
  if (from < current && current <= to) return current - 1
  if (to <= current && current < from) return current + 1
  return current
}

/** Adjusts the tracked selection after a row at `removedIndex` is deleted. */
export function resolveSelectedIndexAfterRemove(
  current: number | null,
  removedIndex: number,
): number | null {
  if (current === null) return null
  return removedIndex < current ? current - 1 : current
}

export function isValidFieldArrayMove(from: number, to: number, length: number): boolean {
  if (from === to) return false
  if (from < 0 || to < 0 || from >= length || to >= length) return false
  return true
}
