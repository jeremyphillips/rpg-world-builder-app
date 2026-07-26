/** Tri-state bulk field operation — unchanged, set a value, or reset to default. */
export type BulkFieldOperation<T> =
  | { kind: 'unchanged' }
  | { kind: 'set'; value: T }
  | { kind: 'reset' }
