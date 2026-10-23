export type DataTableUnavailableAppearance = {
  rowClassName?: string
  nameCellRailClassName?: string
}

/** Row wash and name-cell rail for inactive overview rows — one decision, both classes. */
export function dataTableUnavailableAppearance(
  unavailable: boolean,
): DataTableUnavailableAppearance {
  if (!unavailable) {
    return {}
  }
  return {
    rowClassName: 'ui-data-table__row--unavailable',
    nameCellRailClassName: 'ui-data-table__cell--unavailable-rail',
  }
}

export type DataTableClassSpec = {
  key: string
  className: string
  keyValues: string
  useCase: string
}

export const DATA_TABLE_CLASS_SPECS: DataTableClassSpec[] = [
  {
    key: 'table-wrap',
    className: 'ui-data-table__table-wrap ui-border--default',
    keyValues: 'bg --background, --surface-current --background, ui-border--default',
    useCase: 'Card plane around the grid.',
  },
  {
    key: 'header-row',
    className: 'ui-data-table__header-row ui-border--default',
    keyValues: 'bg --surface-strong, --surface-current --surface-strong, ui-border--default',
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
    className: 'ui-data-table__row ui-interactive-row ui-border--subtle',
    keyValues: '--ui-data-table-row-bg, ui-border--subtle',
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
    className: 'ui-data-table__select ui-border--default',
    keyValues: 'width 2.5rem, checkbox column, ui-border--default',
    useCase: 'Row selection column.',
  },
  {
    key: 'actions',
    className: 'ui-data-table__actions ui-border--default',
    keyValues: 'sticky end, --ui-data-table-row-bg on body, ui-border--default',
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
