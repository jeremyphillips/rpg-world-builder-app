import type { ColumnDef, VisibilityState } from '@tanstack/react-table'

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

/** A free-text search filter rendered as an `<Input>`. */
export interface TextFilterDef {
  type: 'text'
  /**
   * Must exactly match the `accessorKey` of the corresponding column.
   * Mismatches silently produce no filtering — a console.warn fires in dev.
   */
  id: string
  label: string
  placeholder?: string
  group?: FilterGroup
}

/** A single-value select filter rendered as a `<Select>`. */
export interface SelectFilterDef {
  type: 'select'
  /** Must exactly match the `accessorKey` of the corresponding column. */
  id: string
  label: string
  options: Array<{ label: string; value: string }>
  group?: FilterGroup
}

/**
 * A boolean presence filter rendered as a `<Checkbox>` + label.
 * When checked, only rows where the column value is truthy are shown.
 */
export interface BooleanFilterDef {
  type: 'boolean'
  /** Must exactly match the `accessorKey` of the corresponding column. */
  id: string
  label: string
  group?: FilterGroup
}

export type FilterDef = TextFilterDef | SelectFilterDef | BooleanFilterDef

export interface DataTableProps<TData> {
  /** Column definitions — define in a colocated `*-columns.tsx` per the shadcn convention. */
  columns: ColumnDef<TData>[]
  data: TData[]
  /**
   * Declarative filter config. Each entry's `id` must match the `accessorKey`
   * of its column so TanStack Table can apply the right filter value.
   */
  filters?: FilterDef[]
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
}
