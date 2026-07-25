import type {
  ColumnDef,
  Row,
  Cell,
  RowSelectionState,
  VisibilityState,
} from '@tanstack/react-table'

export type DataTableColumnVisibilityTriggerProps = {
  /** Accessible name for the trigger. Defaults to "Choose visible columns". */
  'aria-label'?: string
  /** When true, renders the outlined "Columns" label trigger used by the default toolbar. */
  showLabel?: boolean
}

/** Narrow control surface passed to `utilityStrip` — no imperative table ref. */
export type DataTableUtilityControls<TData> = {
  ColumnVisibilityTrigger: React.ComponentType<DataTableColumnVisibilityTriggerProps>
  pageRowCount: number
  /** Selectable rows on the current page — respects `getRowCanSelect`. */
  pageSelectableRowCount: number
  isAllPageRowsSelected: boolean
  isSomePageRowsSelected: boolean
  toggleAllPageRowsSelected: (value?: boolean) => void
  selectedRowCount: number
  selectedRows: TData[]
  clearRowSelection: () => void
}

export type DataTableSelectionLabels<TData> = {
  selectAll: string | ((pageRowCount: number) => string)
  selectRow?: (row: TData) => string
}

/**
 * Emitted by `onColumnChange` whenever column visibility or order changes.
 * Intended for consumers who want to persist column preferences externally.
 */
export interface ColumnChangeState {
  /** Map of column id → visible. Omitted columns are visible by default. */
  visibility: VisibilityState
  /**
   * Ordered list of all user-facing column ids (excludes injected `select`/`actions`
   * columns). Empty array means the consumer's original definition order is used.
   */
  order: string[]
}

export interface DataTableEmptyStateContext<TData> {
  filteredRowCount: number
  totalRowCount: number
  data: TData[]
}

export interface DataTableProps<TData> {
  /** Column definitions — define in a colocated `*-overview-columns.tsx` for catalog overviews. */
  columns: ColumnDef<TData>[]
  data: TData[]
  /**
   * When provided, a non-sortable, non-hideable "Actions" column is appended.
   * Return a `<DropdownMenu>` or any action trigger from this render function.
   */
  rowActions?: (row: TData) => React.ReactNode
  /** Prepend a checkbox column for multi-row selection. Default: false. */
  enableRowSelection?: boolean
  /** Controlled row selection state keyed by row id. */
  rowSelection?: RowSelectionState
  /**
   * Called with the selected row originals whenever selection changes.
   * Only fired when `enableRowSelection` is true.
   */
  onRowSelectionChange?: (rows: TData[]) => void
  /** Called when row selection state changes — use with `rowSelection` for controlled mode. */
  onRowSelectionStateChange?: (state: RowSelectionState) => void
  /** Contextual labels for selection checkboxes. */
  selectionLabels?: DataTableSelectionLabels<TData>
  /** Stable row id for selection state — defaults to `row.id` when present. */
  getRowId?: (row: TData) => string
  /** When provided, unchecked rows returning false cannot be selected. */
  getRowCanSelect?: (row: TData) => boolean
  /** Element id referenced by disabled row checkboxes via aria-describedby. */
  rowSelectionDescribedBy?: string
  /**
   * Replaces the default toolbar with a tinted utility strip above the table header.
   * Receives page-selection helpers and the column visibility trigger.
   */
  utilityStrip?: (controls: DataTableUtilityControls<TData>) => React.ReactNode
  /** Number of rows per page. Supported values: 10, 20, 50, 100. Default: 20. */
  defaultPageSize?: number
  /** Initial column visibility restored from persisted preferences. */
  initialColumnVisibility?: VisibilityState
  /** Initial column order restored from persisted preferences. */
  initialColumnOrder?: string[]
  /** Accessible caption rendered below the table. */
  caption?: string
  /**
   * Called whenever column visibility or order changes.
   * Use to persist column preferences; persistence itself is not in scope here.
   */
  onColumnChange?: (state: ColumnChangeState) => void
  /** Custom empty body when no rows match. Falls back to "No results." */
  emptyState?: (context: DataTableEmptyStateContext<TData>) => React.ReactNode
  /** Optional per-row class resolver — e.g. faint warning treatment for inactive rows. */
  getRowClassName?: (row: Row<TData>) => string | undefined
  /** Optional per-cell class resolver — e.g. leading accent rail on the first cell. */
  getCellClassName?: (cell: Cell<TData, unknown>) => string | undefined
}
