/**
 * Resolves a `dependsOn` field name to the full RHF watch path.
 *
 * Relative names are prefixed with `namePrefix` (array item scope).
 * Parent-relative names use `../` to pop segments from `namePrefix` before
 * appending the remaining path — e.g. `../level` inside `features.0.grants.0`
 * watches `features.0.level`.
 */
function getValueAtPath(values: Record<string, unknown>, path: string): unknown {
  const segments = path.split('.')
  let current: unknown = values
  for (const segment of segments) {
    if (current === null || typeof current !== 'object') return undefined
    if (Array.isArray(current)) {
      const index = Number(segment)
      if (!Number.isInteger(index)) return undefined
      current = current[index]
      continue
    }
    current = (current as Record<string, unknown>)[segment]
  }
  return current
}

/** Resolves `dependsOn` field names to values for predicates (`visibleWhen`, `disabledWhen`, …). */
export function resolveDependsOnRelativeValues(
  dependsOn: readonly string[],
  formValues: Record<string, unknown>,
  namePrefix?: string,
): Record<string, unknown> {
  const watched: Record<string, unknown> = {}
  for (const dep of dependsOn) {
    const path = resolveDependsOnWatchName(dep, namePrefix)
    watched[dep] = getValueAtPath(formValues, path)
  }
  return watched
}

export function resolveDependsOnWatchName(dep: string, namePrefix?: string): string {
  const parentMatch = dep.match(/^(\.\.\/)+/)
  const parentPrefix = parentMatch?.[0] ?? ''
  const hopCount = parentPrefix.length / 3
  const fieldPath = dep.slice(parentPrefix.length)

  if (hopCount === 0) {
    return namePrefix ? `${namePrefix}.${fieldPath}` : fieldPath
  }

  let prefix = namePrefix ?? ''
  for (let i = 0; i < hopCount; i++) {
    const lastDot = prefix.lastIndexOf('.')
    prefix = lastDot === -1 ? '' : prefix.slice(0, lastDot)
  }

  if (!prefix) return fieldPath
  return `${prefix}.${fieldPath}`
}
