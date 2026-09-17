/**
 * Default level for a new progression row:
 *
 * 1. the first unused allowed level greater than the current maximum used level;
 * 2. otherwise the lowest unused allowed level (gaps such as 2–4 in `[1, 5, 20]`
 *    keep the add action live);
 * 3. `undefined` only when every allowed level is used — the add action should
 *    disable with an accessible reason.
 */
export function resolveNextUnusedLevel(
  usedLevels: readonly number[],
  allowedLevels: readonly number[],
): number | undefined {
  const used = new Set(usedLevels)
  const sortedAllowed = [...allowedLevels].sort((left, right) => left - right)

  if (usedLevels.length > 0) {
    const maxUsed = Math.max(...usedLevels)
    const aboveMax = sortedAllowed.find((level) => level > maxUsed && !used.has(level))
    if (aboveMax !== undefined) return aboveMax
  }

  return sortedAllowed.find((level) => !used.has(level))
}
