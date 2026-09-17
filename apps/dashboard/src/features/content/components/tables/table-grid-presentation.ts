export type TableGridCellValue = string | number

export type TableGridDataRow = {
  kind?: 'data'
  /** Leading row-header cell value when the grid renders with `rowHeaderLabel`. */
  rowHeader?: TableGridCellValue
  cells: Record<string, TableGridCellValue | undefined>
}

export type TableGridTierSeparatorRow = {
  kind: 'tierSeparator'
  label: string
}

export type TableGridPresentationRow = TableGridDataRow | TableGridTierSeparatorRow

export function isTableGridTierSeparatorRow(
  row: TableGridPresentationRow,
): row is TableGridTierSeparatorRow {
  return row.kind === 'tierSeparator'
}

export function isTableGridDataRow(row: TableGridPresentationRow): row is TableGridDataRow {
  return !isTableGridTierSeparatorRow(row)
}

/** Neutral display model for {@link TableGrid} — shared by progression and general tables. */
export type TableGridPresentation = {
  name?: string
  columns: Array<{ key: string; label?: string }>
  rows: TableGridPresentationRow[]
}
