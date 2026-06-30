/** Order-independent equality for string arrays treated as sets (duplicate ids ignored). */
export function sameStringSet(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false
  const rightSet = new Set(right)
  return left.every((value) => rightSet.has(value)) && rightSet.size === left.length
}
