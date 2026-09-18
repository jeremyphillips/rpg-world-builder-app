function walkTouchedFormPaths(node: unknown, prefix: string, touchedPaths: string[]): void {
  if (node === true) {
    if (prefix) touchedPaths.push(prefix)
    return
  }

  if (Array.isArray(node)) {
    node.forEach((entry, index) => {
      if (entry === undefined || entry === null) return
      walkTouchedFormPaths(entry, `${prefix}.${index}`, touchedPaths)
    })
    return
  }

  if (typeof node !== 'object' || node === null) return

  for (const [key, value] of Object.entries(node)) {
    if (value === undefined || value === null) continue
    const nextPath = prefix ? `${prefix}.${key}` : key
    walkTouchedFormPaths(value, nextPath, touchedPaths)
  }
}

/** Flattens react-hook-form touchedFields into dot-path strings. */
export function flattenFormTouchedPaths(touchedFields: unknown): string[] {
  const paths: string[] = []
  walkTouchedFormPaths(touchedFields, '', paths)
  return paths
}
