import type { FieldErrors } from 'react-hook-form'

/** Resolves the effective selection: null when empty, else clamped in range. */
export function resolveSelectedIndex(selected: number | null, length: number): number | null {
  if (length === 0) return null
  if (selected === null || selected < 0) return 0
  if (selected > length - 1) return length - 1
  return selected
}

export function resolveValueAtPath(root: unknown, path: string): unknown {
  if (!path) return root

  let current: unknown = root
  for (const segment of path.split('.')) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[segment]
  }

  return current
}

export function rowHasError(errors: FieldErrors, name: string, index: number): boolean {
  const arrayErrors = resolveValueAtPath(errors, name)
  if (arrayErrors == null) return false

  if (Array.isArray(arrayErrors)) {
    const rowError = arrayErrors[index]
    return rowError != null && typeof rowError === 'object'
  }

  if (typeof arrayErrors === 'object') {
    const rowError = (arrayErrors as Record<number, unknown>)[index]
    return rowError != null && typeof rowError === 'object'
  }

  return false
}

/** Returns the first array index with row-level errors, or `null` when none. */
export function findFirstInvalidRowIndex(errors: FieldErrors, name: string): number | null {
  const arrayErrors = resolveValueAtPath(errors, name)
  if (arrayErrors == null) return null

  if (Array.isArray(arrayErrors)) {
    const index = arrayErrors.findIndex(
      (rowError) => rowError != null && typeof rowError === 'object',
    )
    return index >= 0 ? index : null
  }

  if (typeof arrayErrors === 'object') {
    const indices = Object.keys(arrayErrors)
      .map(Number)
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b)

    for (const index of indices) {
      const rowError = (arrayErrors as Record<number, unknown>)[index]
      if (rowError != null && typeof rowError === 'object') return index
    }
  }

  return null
}

export function autoSelectFirstInvalid(
  errors: FieldErrors,
  name: string,
  select: (index: number) => void,
): void {
  const index = findFirstInvalidRowIndex(errors, name)
  if (index !== null) select(index)
}
