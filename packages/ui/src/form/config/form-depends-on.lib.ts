/**
 * Resolves a `dependsOn` field name to the full RHF watch path.
 *
 * Relative names are prefixed with `namePrefix` (array item scope).
 * Parent-relative names use `../` to pop segments from `namePrefix` before
 * appending the remaining path — e.g. `../level` inside `features.0.grants.0`
 * watches `features.0.level`.
 */
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
