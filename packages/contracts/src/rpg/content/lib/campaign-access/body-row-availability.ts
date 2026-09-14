/** Whether a body-embedded row is available in the campaign (omitted or true = available). */
export function isBodyRowAvailable(row: { available?: boolean }): boolean {
  return row.available !== false
}

/** Filters body-embedded rows to those available in the campaign. */
export function availableBodyRows<T extends { available?: boolean }>(rows: readonly T[]): T[] {
  return rows.filter(isBodyRowAvailable)
}
