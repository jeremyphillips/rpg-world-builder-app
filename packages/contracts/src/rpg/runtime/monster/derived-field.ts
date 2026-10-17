export type DerivedFieldReason = 'missing-input' | 'missing-reference' | 'conflict'

export type DerivedField<T> =
  | { status: 'resolved'; value: T }
  | { status: 'unavailable'; reason: DerivedFieldReason }

export function resolvedField<T>(value: T): DerivedField<T> {
  return { status: 'resolved', value }
}

export function unavailableField<T>(reason: DerivedFieldReason): DerivedField<T> {
  return { status: 'unavailable', reason }
}

/** Published derivation treats an unavailable field as a broken invariant. */
export function requireDerivedField<T>(field: string, result: DerivedField<T>): T {
  if (result.status === 'unavailable') {
    throw new Error(`Monster ${field} is unavailable (${result.reason}).`)
  }
  return result.value
}
