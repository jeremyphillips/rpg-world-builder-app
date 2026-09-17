export type TableGridCellValue = string | number

export type TableGridPresentationRow = {
  /** Leading row-header cell value when the grid renders with `rowHeaderLabel`. */
  rowHeader?: TableGridCellValue
  cells: Record<string, TableGridCellValue | undefined>
}

/** Neutral display model for {@link TableGrid} — shared by progression and general tables. */
export type TableGridPresentation = {
  name?: string
  columns: Array<{ key: string; label?: string }>
  rows: TableGridPresentationRow[]
}
