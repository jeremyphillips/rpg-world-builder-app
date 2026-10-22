/** Unavailable overview row — applied via `getRowClassName`. */
export function dataTableRowUnavailableVariants(): string {
  return 'ui-data-table__row--unavailable'
}

/** Leading name-cell accent for unavailable rows — applied via `getCellClassName`. */
export function dataTableRowUnavailableRailVariants(): string {
  return 'ui-data-table__cell--unavailable-rail'
}

export const DATA_TABLE_HEAD_CLASS = 'ui-data-table__head'
export const DATA_TABLE_HEADER_ROW_CLASS = 'ui-data-table__header-row'
export const DATA_TABLE_ROW_CLASS = 'ui-data-table__row'
export const DATA_TABLE_CELL_CLASS = 'ui-data-table__cell'
export const DATA_TABLE_CELL_MUTED_CLASS = 'ui-data-table__cell--muted'
export const DATA_TABLE_EMPTY_ROW_CLASS = 'ui-data-table__empty-row'
export const DATA_TABLE_EMPTY_CLASS = 'ui-data-table__empty'
export const DATA_TABLE_SELECT_CLASS = 'ui-data-table__select'
export const DATA_TABLE_ACTIONS_CLASS = 'ui-data-table__actions'

export type DataTableClassSpec = {
  key: string
  className: string
  keyValues: string
  useCase: string
}

export const DATA_TABLE_CLASS_SPECS: DataTableClassSpec[] = [
  {
    key: 'table-wrap',
    className: 'ui-data-table__table-wrap',
    keyValues: 'bg --background, --ui-surface-bg',
    useCase: 'Card plane around the grid.',
  },
  {
    key: 'header-row',
    className: 'ui-data-table__header-row',
    keyValues: 'bg --surface-strong, border --border',
    useCase: 'Header band; not an interactive row.',
  },
  {
    key: 'head',
    className: 'ui-data-table__head',
    keyValues: 'height 2.5rem, type xs semibold muted',
    useCase: 'Column header cell.',
  },
  {
    key: 'row',
    className: 'ui-data-table__row ui-interactive-row',
    keyValues: '--ui-data-table-row-bg',
    useCase: 'Body row; composes interactive row once.',
  },
  {
    key: 'row-unavailable',
    className: 'ui-data-table__row--unavailable',
    keyValues: 'bg --warning-faint',
    useCase: 'Inactive / unavailable overview row.',
  },
  {
    key: 'cell',
    className: 'ui-data-table__cell',
    keyValues: 'padding 12px × 8px',
    useCase: 'Body data cell.',
  },
  {
    key: 'cell-muted',
    className: 'ui-data-table__cell--muted',
    keyValues: 'fg --muted-foreground',
    useCase: 'Data and source column tones.',
  },
  {
    key: 'cell-unavailable-rail',
    className: 'ui-data-table__cell--unavailable-rail',
    keyValues: 'inset accent --semantic-warning-accent-faint',
    useCase: 'Name cell status rail.',
  },
  {
    key: 'select',
    className: 'ui-data-table__select',
    keyValues: 'width 2.5rem, checkbox column',
    useCase: 'Row selection column.',
  },
  {
    key: 'actions',
    className: 'ui-data-table__actions',
    keyValues: 'sticky end, --ui-data-table-row-bg on body',
    useCase: 'Trailing actions column.',
  },
  {
    key: 'sort-icon-idle',
    className: 'ui-data-table__sort-icon ui-data-table__sort-icon--idle',
    keyValues: 'opacity 0 → 0.5 on head hover/focus-within',
    useCase: 'Unsorted column affordance.',
  },
  {
    key: 'empty-row',
    className: 'ui-data-table__empty-row',
    keyValues: 'structural only',
    useCase: 'Placeholder row when the table has no data rows.',
  },
  {
    key: 'empty',
    className: 'ui-data-table__empty',
    keyValues: 'height 6rem, muted copy',
    useCase: 'No-results cell chrome (spans all columns).',
  },
]
