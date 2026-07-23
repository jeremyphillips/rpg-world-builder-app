import type {
  ColumnDef,
  ColumnFiltersState,
  OnChangeFn,
  Row,
  Cell,
  VisibilityState,
} from '@tanstack/react-table'

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

/**
 * Which toolbar row a filter appears in.
 * - `'primary'`   — always-visible top toolbar row (default for text and select filters)
 * - `'secondary'` — collapsible "Advanced filters" panel below the toolbar
 *   (default for boolean filters)
 */
export type FilterGroup = 'primary' | 'secondary'

interface FilterDefBase<TData = unknown> {
  id: string
  label: string
  group?: FilterGroup
  /**
   * When set, filtering uses this predicate instead of a column-backed TanStack
   * filter. Enables filters that are not backed by a visible column.
   */
  matches?: (row: TData, value: unknown) => boolean
}

/** A free-text search filter rendered as an `<Input>`. */
export interface TextFilterDef<TData = unknown> extends FilterDefBase<TData> {
  type: 'text'
  /**
   * Must exactly match the `accessorKey` of the corresponding column when no
   * `matches` predicate is provided. Mismatches silently produce no filtering —
   * a console.warn fires in dev.
   */
  placeholder?: string
}

/** A single-value select filter rendered as a `<Select>`. */
export interface SelectFilterDef<TData = unknown> extends FilterDefBase<TData> {
  type: 'select'
  /** Must exactly match the `accessorKey` of the corresponding column when no `matches` is set. */
  options: Array<{ label: string; value: string }>
  /** Initial value when uncontrolled. Select always retains an explicit value when set. */
  defaultValue?: string
  /** When false, omits the generic "All {label}" option. Default: true. */
  showAllOption?: boolean
}

/**
 * A boolean presence filter rendered as a `<Checkbox>` + label.
 * When checked, only rows where the column value is truthy are shown.
 */
export interface BooleanFilterDef<TData = unknown> extends FilterDefBase<TData> {
  type: 'boolean'
  /** Must exactly match the `accessorKey` of the corresponding column when no `matches` is set. */
}

export type FilterDef<TData = unknown> =
  | TextFilterDef<TData>
  | SelectFilterDef<TData>
  | BooleanFilterDef<TData>

export interface DataTableEmptyStateContext<TData> {
  columnFilters: ColumnFiltersState
  filteredRowCount: number
  totalRowCount: number
  data: TData[]
}

export interface DataTableProps<TData> {
  /** Column definitions — define in a colocated `*-overview-columns.tsx` for catalog overviews. */
  columns: ColumnDef<TData>[]
  data: TData[]
  /**
   * Declarative filter config. Each entry's `id` must match the `accessorKey`
   * of its column when no `matches` predicate is provided.
   */
  filters?: FilterDef<TData>[]
  /**
   * Controlled column filter state. Pair with `onColumnFiltersChange` for
   * orchestration layers that drive filter actions externally.
   */
  columnFilters?: ColumnFiltersState
  /** Called when column filters change. */
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>
  /** Initial column filters when uncontrolled. */
  defaultColumnFilters?: ColumnFiltersState
  /**
   * When provided, a non-sortable, non-hideable "Actions" column is appended.
   * Return a `<DropdownMenu>` or any action trigger from this render function.
   */
  rowActions?: (row: TData) => React.ReactNode
  /** Prepend a checkbox column for multi-row selection. Default: false. */
  enableRowSelection?: boolean
  /**
   * Called with the selected row originals whenever selection changes.
   * Only fired when `enableRowSelection` is true.
   */
  onRowSelectionChange?: (rows: TData[]) => void
  /** Number of rows per page. Supported values: 10, 20, 50, 100. Default: 20. */
  defaultPageSize?: number
  /** Accessible caption rendered below the table. */
  caption?: string
  /**
   * Called whenever column visibility or order changes.
   * Use to persist column preferences; persistence itself is not in scope here.
   */
  onColumnChange?: (state: ColumnChangeState) => void
  /** Supplementary notice rendered below the toolbar (e.g. hidden-count messaging). */
  filterNotice?: React.ReactNode
  /** Custom empty body when no rows match. Falls back to "No results." */
  emptyState?: (context: DataTableEmptyStateContext<TData>) => React.ReactNode
  /** Optional per-row class resolver — e.g. faint warning treatment for inactive rows. */
  getRowClassName?: (row: Row<TData>) => string | undefined
  /** Optional per-cell class resolver — e.g. leading accent rail on the first cell. */
  getCellClassName?: (cell: Cell<TData, unknown>) => string | undefined
}
