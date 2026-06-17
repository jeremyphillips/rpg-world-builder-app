'use client'

// Augment TanStack Table to recognise the custom filter function names used
// by this module so that `filterFn: 'boolean'` and `filterFn: 'equalsString'`
// are valid string literals on ColumnDef.
import type { FilterFn } from '@tanstack/react-table'
declare module '@tanstack/react-table' {
  interface FilterFns {
    boolean: FilterFn<unknown>
    equalsString: FilterFn<unknown>
  }
  // Allow column defs to pass className overrides through meta
  interface ColumnMeta<TData, TValue> {
    headerClassName?: string
    cellClassName?: string
    // Suppress unused type param warnings
    _data?: TData
    _value?: TValue
  }
}

import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  Columns3,
  Ellipsis,
  Filter,
  GripVertical,
  Pencil,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import * as PopoverPrimitive from '@radix-ui/react-popover'

import { Button } from './button.client'
import { Checkbox } from './checkbox.client'
import { Collapsible, CollapsibleContent } from './collapsible.client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu.client'
import { Input } from './input.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
import { Switch } from './switch.client'
import { InfoTooltip } from './tooltip.client'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'
import { Badge } from './badge'
import type {
  BooleanFilterDef,
  ColumnChangeState,
  DataTableProps,
  FilterDef,
  SelectFilterDef,
  TextFilterDef,
} from './data-table.types'
import {
  dataTableAdvancedInnerVariants,
  dataTableAdvancedPanelVariants,
  dataTableColumnDragHandleVariants,
  dataTableColumnItemVariants,
  dataTableColumnPanelVariants,
  dataTableFilterControlVariants,
  dataTableFilterGroupVariants,
  dataTablePaginationVariants,
  dataTableRootVariants,
  dataTableTableWrapVariants,
  dataTableToolbarVariants,
} from './data-table.variants'

// ---------------------------------------------------------------------------
// Custom filter functions
// ---------------------------------------------------------------------------

/**
 * Boolean presence filter. Only rows where the column value is truthy pass.
 * Register on a column via `filterFn: 'boolean'`.
 */
const booleanFilterFn: FilterFn<unknown> = (row, columnId) => {
  return Boolean(row.getValue(columnId))
}
booleanFilterFn.autoRemove = (val: unknown) => !val

/**
 * String-coerced equality filter. Use on numeric or other non-string columns
 * paired with a `SelectFilterDef`, e.g. `filterFn: 'equalsString'` on the
 * column definition. Compares `String(cellValue) === String(filterValue)`.
 */
const equalsStringFilterFn: FilterFn<unknown> = (row, columnId, filterValue) => {
  return String(row.getValue(columnId)) === String(filterValue)
}
equalsStringFilterFn.autoRemove = (val: unknown) => val == null || val === ''

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDefaultGroup(filter: FilterDef): 'primary' | 'secondary' {
  if (filter.group) return filter.group
  return filter.type === 'boolean' ? 'secondary' : 'primary'
}

// ---------------------------------------------------------------------------
// Toolbar filter renderers
// ---------------------------------------------------------------------------

interface FilterControlProps {
  filter: FilterDef
  column: Column<unknown> | undefined
}

function TextFilterControl({ filter, column }: FilterControlProps & { filter: TextFilterDef }) {
  const value = (column?.getFilterValue() as string | undefined) ?? ''
  return (
    <div className={dataTableFilterControlVariants({ type: 'text' })}>
      <Input
        placeholder={filter.placeholder ?? `Filter ${filter.label}…`}
        value={value}
        onChange={(e) => column?.setFilterValue(e.target.value || undefined)}
        aria-label={filter.label}
        size="sm"
      />
    </div>
  )
}

function SelectFilterControl({ filter, column }: FilterControlProps & { filter: SelectFilterDef }) {
  const value = (column?.getFilterValue() as string | undefined) ?? ''
  return (
    <div className={dataTableFilterControlVariants({ type: 'select' })}>
      <Select
        value={value}
        onValueChange={(v) => column?.setFilterValue(v === '__all__' ? undefined : v)}
      >
        <SelectTrigger aria-label={filter.label} size="sm">
          <SelectValue placeholder={filter.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All {filter.label}</SelectItem>
          {filter.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function BooleanFilterControl({
  filter,
  column,
}: FilterControlProps & { filter: BooleanFilterDef }) {
  const isChecked = Boolean(column?.getFilterValue())
  return (
    <div className={dataTableFilterControlVariants({ type: 'boolean' })}>
      <Checkbox
        id={`filter-${filter.id}`}
        checked={isChecked}
        onCheckedChange={(checked) => column?.setFilterValue(checked ? true : undefined)}
      />
      <label
        htmlFor={`filter-${filter.id}`}
        className="cursor-pointer text-sm font-medium leading-none"
      >
        {filter.label}
      </label>
    </div>
  )
}

function FilterControl({ filter, column }: FilterControlProps) {
  if (filter.type === 'text') return <TextFilterControl filter={filter} column={column} />
  if (filter.type === 'select') return <SelectFilterControl filter={filter} column={column} />
  return <BooleanFilterControl filter={filter} column={column} />
}

// ---------------------------------------------------------------------------
// DataTableColumnPanel — DnD-sortable column visibility + order editor
// ---------------------------------------------------------------------------

interface ColumnPanelItemProps<TData> {
  col: Column<TData>
  colName: string
}

function ColumnPanelItem<TData>({ col, colName }: ColumnPanelItemProps<TData>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: col.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 1 : 'auto',
  }

  const isVisible = col.getIsVisible()

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={dataTableColumnItemVariants()}
        onClick={() => col.toggleVisibility()}
        role="button"
        tabIndex={0}
        aria-pressed={isVisible}
        aria-label={`${isVisible ? 'Hide' : 'Show'} ${colName} column`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            col.toggleVisibility()
          }
        }}
      >
        {/* Drag handle — separate from the visibility click target */}
        <button
          type="button"
          className={dataTableColumnDragHandleVariants()}
          aria-label={`Drag to reorder ${colName}`}
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>

        <span className="flex-1 select-none text-sm">{colName}</span>

        {isVisible && <Check className="size-3.5 shrink-0 text-foreground" aria-hidden />}
      </div>
    </div>
  )
}

interface DataTableColumnPanelProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  onColumnChange?: (state: ColumnChangeState) => void
}

function DataTableColumnPanel<TData>({ table, onColumnChange }: DataTableColumnPanelProps<TData>) {
  const [search, setSearch] = React.useState('')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Only show hideable columns (excludes injected select / actions)
  const hideableCols = table.getAllColumns().filter((col) => col.getCanHide())

  const filteredCols = search.trim()
    ? hideableCols.filter((col) => {
        const name = typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id
        return name.toLowerCase().includes(search.toLowerCase())
      })
    : hideableCols

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIds = hideableCols.map((c) => c.id)
    const oldIndex = oldIds.indexOf(String(active.id))
    const newIndex = oldIds.indexOf(String(over.id))
    const newOrder = arrayMove(oldIds, oldIndex, newIndex)

    // Prepend injected non-hideable column ids so TanStack gets the full list
    const nonHideable = table
      .getAllColumns()
      .filter((c) => !c.getCanHide())
      .map((c) => c.id)
    const fullOrder = [
      ...nonHideable.filter((id) => id === 'select'),
      ...newOrder,
      ...nonHideable.filter((id) => id === 'actions'),
    ]

    table.setColumnOrder(fullOrder)
    onColumnChange?.({
      visibility: table.getState().columnVisibility,
      order: newOrder,
    })
  }

  function handleReset() {
    table.setColumnOrder([])
    table.resetColumnVisibility()
    onColumnChange?.({ visibility: {}, order: [] })
  }

  const colIds = filteredCols.map((c) => c.id)

  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Columns3 className="size-3.5" />
          Columns
        </Button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={4}
          className={dataTableColumnPanelVariants()}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              type="search"
              placeholder="Search columns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Search columns"
            />
          </div>

          {/* Sortable column list */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={colIds} strategy={verticalListSortingStrategy}>
              <div className="max-h-[320px] overflow-y-auto py-1">
                {filteredCols.length > 0 ? (
                  filteredCols.map((col) => {
                    const name =
                      typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id
                    return <ColumnPanelItem key={col.id} col={col} colName={name} />
                  })
                ) : (
                  <p className="px-3 py-2 text-sm text-muted-foreground">No columns found.</p>
                )}
              </div>
            </SortableContext>
          </DndContext>

          {/* Reset */}
          <div className="border-t border-border px-1 py-1.5">
            <button
              type="button"
              onClick={handleReset}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <RotateCcw className="size-3.5" />
              Reset Column Order
            </button>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

// ---------------------------------------------------------------------------
// DataTableToolbar
// ---------------------------------------------------------------------------

interface DataTableToolbarProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  primaryFilters: FilterDef[]
  secondaryFilterCount: number
  activeSecondaryCount: number
  advancedOpen: boolean
  onToggleAdvanced: () => void
  onColumnChange?: (state: ColumnChangeState) => void
}

function DataTableToolbar<TData>({
  table,
  primaryFilters,
  secondaryFilterCount,
  activeSecondaryCount,
  advancedOpen,
  onToggleAdvanced,
  onColumnChange,
}: DataTableToolbarProps<TData>) {
  return (
    <div className={dataTableToolbarVariants()}>
      {/* Primary filters */}
      <div className={dataTableFilterGroupVariants()}>
        {primaryFilters.map((filter) => (
          <FilterControl
            key={filter.id}
            filter={filter}
            column={table.getColumn(filter.id) as Column<unknown> | undefined}
          />
        ))}
      </div>

      {/* Right-side controls */}
      <div className="flex items-center gap-2">
        {/* Advanced filters toggle */}
        {secondaryFilterCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAdvanced}
            aria-expanded={advancedOpen}
            className="gap-1.5"
          >
            <Filter className="size-3.5" />
            Filters
            {activeSecondaryCount > 0 && (
              <Badge variant="secondary" className="ml-0.5 px-1.5 py-0">
                {activeSecondaryCount}
              </Badge>
            )}
            {advancedOpen ? (
              <ChevronUp className="size-3.5 opacity-60" />
            ) : (
              <ChevronDown className="size-3.5 opacity-60" />
            )}
          </Button>
        )}

        {/* Column panel */}
        <DataTableColumnPanel table={table} onColumnChange={onColumnChange} />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DataTableAdvancedFilters
// ---------------------------------------------------------------------------

interface DataTableAdvancedFiltersProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  secondaryFilters: FilterDef[]
  open: boolean
  hasActiveFilters: boolean
  onClearAll: () => void
}

function DataTableAdvancedFilters<TData>({
  table,
  secondaryFilters,
  open,
  hasActiveFilters,
  onClearAll,
}: DataTableAdvancedFiltersProps<TData>) {
  if (secondaryFilters.length === 0) return null

  const cols = Math.min(secondaryFilters.length, 3) as 1 | 2 | 3
  const colValue = cols <= 1 ? 1 : cols <= 2 ? 2 : 3

  return (
    <Collapsible open={open}>
      <CollapsibleContent>
        <div className={dataTableAdvancedPanelVariants()}>
          <div className={dataTableAdvancedInnerVariants({ cols: colValue })}>
            {secondaryFilters.map((filter) => (
              <FilterControl
                key={filter.id}
                filter={filter}
                column={table.getColumn(filter.id) as Column<unknown> | undefined}
              />
            ))}
          </div>
          {hasActiveFilters && (
            <div className="flex items-center justify-end border-t border-border px-4 py-2">
              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

// ---------------------------------------------------------------------------
// DataTablePagination
// ---------------------------------------------------------------------------

interface DataTablePaginationProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const start = pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <div className={dataTablePaginationVariants()}>
      <span aria-live="polite" aria-atomic>
        {totalRows === 0 ? 'No results' : `${start}–${end} of ${totalRows}`}
      </span>

      <div className="flex items-center gap-2">
        <label htmlFor="page-size-select" className="sr-only">
          Rows per page
        </label>
        <Select value={String(pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
          <SelectTrigger id="page-size-select" size="sm" className="w-[90px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Go to previous page"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Go to next page"
        >
          Next
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SortableHeader helper — re-usable by consumers in their column defs
// ---------------------------------------------------------------------------

interface SortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  children: React.ReactNode
  /**
   * Explicit accessible label for the sort button.
   * Required when `children` contains non-string nodes (e.g. an `InfoTooltip`);
   * falls back to `children.toString()` for plain string children.
   */
  label?: string
}

export function SortableHeader<TData, TValue>({
  column,
  children,
  label,
}: SortableHeaderProps<TData, TValue>) {
  const ariaLabel = `Sort by ${label ?? (typeof children === 'string' ? children : '')}`
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      aria-label={ariaLabel}
    >
      {children}
      <ArrowUpDown className="ml-1 size-3.5 opacity-50" />
    </Button>
  )
}

// ---------------------------------------------------------------------------
// BooleanCell helper — renders a check / x icon for boolean column values
// ---------------------------------------------------------------------------

export interface BooleanCellProps {
  value: boolean
  /**
   * When true (default), renders Lucide icons instead of text.
   * The false/negative icon is rendered at reduced opacity to reduce visual noise.
   */
  icons?: boolean
}

export function BooleanCell({ value, icons = true }: BooleanCellProps) {
  if (!icons) return <>{value ? 'Yes' : '—'}</>
  return value ? (
    <Check className="size-4" aria-label="Yes" />
  ) : (
    <X className="size-4 opacity-30" aria-label="No" />
  )
}

// ---------------------------------------------------------------------------
// RowActionsMenu — standard ellipsis actions menu for table rows
// ---------------------------------------------------------------------------

export interface RowActionsMenuProps {
  /** Href for the edit route — rendered as an `<a>` tag so Next.js Link can wrap it. */
  editHref: string
  /** Whether this item is currently active in the campaign. */
  enabled: boolean
  /** Called with the new boolean when the active-in-campaign toggle changes. */
  onToggleEnabled: (enabled: boolean) => void
  /**
   * Label for the campaign toggle.
   * Should be scoped to the context: "Active in campaign", not just "Enabled".
   * Defaults to "Active in campaign".
   */
  enabledLabel?: string
  /**
   * Tooltip text that answers "what happens when I turn this off?".
   * Shown via the info icon next to the toggle label.
   */
  enabledTooltip?: string
  /**
   * Human-readable noun for this row's item type, used in the trigger aria-label.
   * Defaults to "item". Pass "class", "spell", etc. for more specific labels.
   */
  itemLabel?: string
}

/**
 * Pre-built row actions dropdown for the `rowActions` prop.
 *
 * Renders an ellipsis (⋯) trigger that opens a menu containing:
 * - An **Edit** link (navigates to `editHref`)
 * - An **Active in campaign** toggle (Switch + InfoTooltip)
 *
 * The dropdown stays open when the switch is clicked so the user can see
 * the state change before dismissing. A future warning modal should be
 * wired in the `onToggleEnabled` handler — check whether the item is
 * in use before committing the change, then show a `<ConfirmDialog>` if so.
 */
export function RowActionsMenu({
  editHref,
  enabled,
  onToggleEnabled,
  enabledLabel = 'Active in campaign',
  enabledTooltip = 'Hides this item from players in the current campaign. The item remains available globally.',
  itemLabel = 'item',
}: RowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="size-8 p-0"
          aria-label={`Open actions for this ${itemLabel}`}
        >
          <Ellipsis className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild className="text-xs [&_svg]:size-3">
          <a href={editHref}>
            <Pencil />
            Edit
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* onSelect preventDefault keeps the menu open after the switch is toggled */}
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="flex items-center justify-between gap-2 pr-1.5 text-xs [&_svg]:size-3"
        >
          <div className="flex items-center gap-1">
            <span>{enabledLabel}</span>
            <InfoTooltip aria-label={`About: ${enabledLabel}`}>{enabledTooltip}</InfoTooltip>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggleEnabled}
            aria-label={enabledLabel}
            onClick={(e) => e.stopPropagation()}
            className="h-4 w-7 [&>[data-state]]:size-3 [&>[data-state=checked]]:translate-x-3"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ---------------------------------------------------------------------------
// DataTable — main component
// ---------------------------------------------------------------------------

export function DataTable<TData>({
  columns,
  data,
  filters = [],
  rowActions,
  enableRowSelection = false,
  onRowSelectionChange,
  defaultPageSize = 20,
  caption,
  onColumnChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const [advancedOpen, setAdvancedOpen] = React.useState(false)

  // Warn in dev when a filter id doesn't match any column accessorKey
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const columnIds = new Set(columns.map((c) => (c as { accessorKey?: string }).accessorKey ?? ''))
    for (const f of filters) {
      if (!columnIds.has(f.id)) {
        console.warn(
          `[DataTable] filter id "${f.id}" does not match any column accessorKey. Filtering will be silently skipped.`,
        )
      }
    }
    // Only run on mount — columns/filters are treated as stable config
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Notify parent when column visibility changes
  const onColumnChangeRef = React.useRef(onColumnChange)
  onColumnChangeRef.current = onColumnChange
  React.useEffect(() => {
    onColumnChangeRef.current?.({
      visibility: columnVisibility,
      order: columnOrder,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnVisibility, columnOrder])

  // Inject selection column
  const selectionColumn: ColumnDef<TData> = {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() ? 'indeterminate' : false)
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label="Select all rows on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: { headerClassName: 'w-px', cellClassName: 'w-px' },
  }

  // Inject actions column
  const actionsColumn: ColumnDef<TData> = {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => rowActions?.(row.original) ?? null,
    enableSorting: false,
    enableHiding: false,
  }

  const resolvedColumns: ColumnDef<TData>[] = [
    ...(enableRowSelection ? [selectionColumn] : []),
    ...columns,
    ...(rowActions ? [actionsColumn] : []),
  ]

  const table = useReactTable({
    data,
    columns: resolvedColumns,
    state: { sorting, columnFilters, columnVisibility, columnOrder, rowSelection, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      // Reset to first page whenever filters change
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
      setColumnFilters(updater)
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: { boolean: booleanFilterFn, equalsString: equalsStringFilterFn },
    enableRowSelection,
  })

  // Notify parent of selection changes
  React.useEffect(() => {
    onRowSelectionChange?.(table.getSelectedRowModel().rows.map((r) => r.original))
  }, [rowSelection, onRowSelectionChange, table])

  const primaryFilters = filters.filter((f) => getDefaultGroup(f) === 'primary')
  const secondaryFilters = filters.filter((f) => getDefaultGroup(f) === 'secondary')

  const activeSecondaryCount = secondaryFilters.filter((f) => {
    const col = table.getColumn(f.id)
    return col?.getFilterValue() != null
  }).length

  const hasAnyActiveFilter = columnFilters.length > 0

  function clearAllFilters() {
    table.resetColumnFilters()
  }

  const rows = table.getRowModel().rows

  return (
    <div className={dataTableRootVariants()}>
      {/* Toolbar */}
      <DataTableToolbar
        table={table}
        primaryFilters={primaryFilters}
        secondaryFilterCount={secondaryFilters.length}
        activeSecondaryCount={activeSecondaryCount}
        advancedOpen={advancedOpen}
        onToggleAdvanced={() => setAdvancedOpen((o) => !o)}
        onColumnChange={onColumnChange}
      />

      {/* Advanced filters panel */}
      <DataTableAdvancedFilters
        table={table}
        secondaryFilters={secondaryFilters}
        open={advancedOpen}
        hasActiveFilters={hasAnyActiveFilter}
        onClearAll={clearAllFilters}
      />

      {/* Table */}
      <div className={dataTableTableWrapVariants()}>
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={header.column.columnDef.meta?.headerClassName}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.cellClassName}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={resolvedColumns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} />
    </div>
  )
}
