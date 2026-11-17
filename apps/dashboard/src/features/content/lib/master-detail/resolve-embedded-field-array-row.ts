/** True when an embedded field-array slot has a materialized row object (not watch lag). */
export function isEmbeddedFieldArrayRowReady(row: unknown): row is Record<string, unknown> {
  return row !== undefined && row !== null && typeof row === 'object' && !Array.isArray(row)
}

/**
 * Reads one embedded field-array row by index. Prefers the live form value store,
 * then watch — one resolution path for list and detail surfaces.
 */
export function readEmbeddedFieldArrayRow(
  fieldName: string,
  index: number,
  getValues: (name: string) => unknown,
  watched: readonly unknown[] | undefined,
): unknown | undefined {
  const fromStore = getValues(`${fieldName}.${index}`)
  if (isEmbeddedFieldArrayRowReady(fromStore)) return fromStore
  const fromWatch = watched?.[index]
  if (isEmbeddedFieldArrayRowReady(fromWatch)) return fromWatch
  return undefined
}

/** Snapshot aligned to `useFieldArray().fields` indices. */
export function buildEmbeddedFieldArrayRowSnapshot<TRow>(
  fieldName: string,
  fieldCount: number,
  getValues: (name: string) => unknown,
  watched: readonly unknown[] | undefined,
): readonly (TRow | undefined)[] {
  const rows: (TRow | undefined)[] = []
  for (let index = 0; index < fieldCount; index++) {
    const row = readEmbeddedFieldArrayRow(fieldName, index, getValues, watched)
    rows.push(isEmbeddedFieldArrayRowReady(row) ? (row as TRow) : undefined)
  }
  return rows
}
