/** True when the user has edited at least one registered field. */
export function hasDirtyFields(dirtyFields: Record<string, unknown>): boolean {
  return Object.values(dirtyFields).some((value) => {
    if (value === true) return true
    if (value && typeof value === 'object') {
      return hasDirtyFields(value as Record<string, unknown>)
    }
    return false
  })
}
