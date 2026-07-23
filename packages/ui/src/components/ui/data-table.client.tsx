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
    /** Background tone for body cells — identity, data, source, actions, or neutral. */
    columnTone?: 'identity' | 'data' | 'source' | 'actions' | 'neutral'
    /** Display name shown in the column visibility panel. Required when the
     *  column header is a JSX function (e.g. SortableHeader) so the panel
     *  does not fall back to the raw column id. */
    label?: string
    /** When true the column appears in the panel with a lock icon but cannot
     *  be hidden or drag-reordered. Pair with `enableHiding: false`. */
    locked?: boolean
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
  Lock,
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

import { cn } from '../../lib/utils'
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
import { Badge, type BadgeAppearance, type BadgeTone } from './badge'
import { dataTableWidthMeta } from './data-table-meta'
import type {
  BooleanFilterDef,
  ColumnChangeState,
  DataTableEmptyStateContext,
  DataTableProps,
  FilterDef,
  SelectFilterDef,
  TextFilterDef,
} from './data-table.types'
import {
  dataTableAdvancedInnerVariants,
  dataTableAdvancedPanelVariants,
  dataTableBodyCellPaddingVariants,
  dataTableBodyCellVariants,
  dataTableCaptionVariants,
  dataTableColumnDragHandleVariants,
  dataTableColumnItemVariants,
  dataTableColumnPanelVariants,
  dataTableEmptyPanelVariants,
  dataTableEmptyStateVariants,
  dataTableFilterChipVariants,
  dataTableFilterControlVariants,
  dataTableFilterGroupVariants,
  dataTableFilterNoticeVariants,
  dataTablePaginationVariants,
  dataTableResetColumnVariants,
  dataTableRowVariants,
  dataTableSortIconVariants,
  dataTableHeaderCellVariants,
  dataTableHeaderRowVariants,
  dataTableImageVariants,
  dataTableLockedColumnVariants,
  dataTableNameCellVariants,
  dataTableRootVariants,
  dataTableTableVariants,
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

function getDefaultGroup<TData>(filter: FilterDef<TData>): 'primary' | 'secondary' {
  if (filter.group) return filter.group
  return filter.type === 'boolean' ? 'secondary' : 'primary'
}

function getEffectiveFilterValue<TData>(
  filter: FilterDef<TData>,
  columnFilters: ColumnFiltersState,
): unknown {
  const entry = columnFilters.find((f) => f.id === filter.id)
  if (entry !== undefined) return entry.value
  if (filter.type === 'select' && filter.defaultValue !== undefined) return filter.defaultValue
  return undefined
}

function isFilterActive<TData>(
  filter: FilterDef<TData>,
  columnFilters: ColumnFiltersState,
): boolean {
  const value = getEffectiveFilterValue(filter, columnFilters)
  if (filter.type === 'select') {
    if (filter.defaultValue !== undefined) {
      const effective = (value ?? filter.defaultValue) as string
      return effective !== filter.defaultValue
    }
    return value !== undefined && value !== ''
  }
  if (filter.type === 'boolean') return Boolean(value)
  return value !== undefined && value !== ''
}

function buildDefaultColumnFilters<TData>(filters: FilterDef<TData>[]): ColumnFiltersState {
  return filters
    .filter(
      (filter): filter is SelectFilterDef<TData> =>
        filter.type === 'select' && filter.defaultValue !== undefined,
    )
    .map((filter) => ({ id: filter.id, value: filter.defaultValue! }))
}

function applyExternalFilters<TData>(
  data: TData[],
  filters: FilterDef<TData>[],
  columnFilters: ColumnFiltersState,
): TData[] {
  const externalFilters = filters.filter(
    (filter): filter is FilterDef<TData> & { matches: (row: TData, value: unknown) => boolean } =>
      typeof filter.matches === 'function',
  )

  if (externalFilters.length === 0) return data

  return data.filter((row) =>
    externalFilters.every((filter) => {
      const value = getEffectiveFilterValue(filter, columnFilters)
      if (value === undefined) return true
      return filter.matches(row, value)
    }),
  )
}

function setFilterValueInState<TData>(
  columnFilters: ColumnFiltersState,
  filterId: string,
  value: unknown,
  filter?: FilterDef<TData>,
): ColumnFiltersState {
  const next = columnFilters.filter((entry) => entry.id !== filterId)
  if (value === undefined) return next
  if (
    filter?.type === 'select' &&
    filter.defaultValue !== undefined &&
    value === filter.defaultValue
  ) {
    return next
  }
  return [...next, { id: filterId, value }]
}

// ---------------------------------------------------------------------------
// Toolbar filter renderers
// ---------------------------------------------------------------------------

interface FilterControlProps<TData> {
  filter: FilterDef<TData>
  value: unknown
  onValueChange: (value: unknown) => void
}

function TextFilterControl<TData>({
  filter,
  value,
  onValueChange,
}: {
  filter: TextFilterDef<TData>
  value: unknown
  onValueChange: (value: unknown) => void
}) {
  const textValue = (value as string | undefined) ?? ''
  return (
    <div className={dataTableFilterControlVariants({ type: 'text' })}>
      <Input
        placeholder={filter.placeholder ?? `Filter ${filter.label}…`}
        value={textValue}
        onChange={(e) => onValueChange(e.target.value || undefined)}
        aria-label={filter.label}
        size="sm"
      />
    </div>
  )
}

function SelectFilterControl<TData>({
  filter,
  value,
  onValueChange,
}: {
  filter: SelectFilterDef<TData>
  value: unknown
  onValueChange: (value: unknown) => void
}) {
  const showAllOption = filter.showAllOption ?? true
  const defaultValue = filter.defaultValue ?? ''
  const effectiveValue = (value as string | undefined) ?? defaultValue

  return (
    <div className={dataTableFilterControlVariants({ type: 'select' })}>
      <Select
        value={effectiveValue}
        onValueChange={(nextValue) => {
          if (showAllOption && nextValue === '__all__') {
            onValueChange(undefined)
            return
          }
          onValueChange(nextValue)
        }}
      >
        <SelectTrigger aria-label={filter.label} size="sm">
          <SelectValue placeholder={filter.label} />
        </SelectTrigger>
        <SelectContent>
          {showAllOption ? <SelectItem value="__all__">All {filter.label}</SelectItem> : null}
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

function BooleanFilterControl<TData>({
  filter,
  value,
  onValueChange,
}: {
  filter: BooleanFilterDef<TData>
  value: unknown
  onValueChange: (value: unknown) => void
}) {
  const isChecked = Boolean(value)
  return (
    <div className={dataTableFilterControlVariants({ type: 'boolean' })}>
      <Checkbox
        id={`filter-${filter.id}`}
        checked={isChecked}
        onCheckedChange={(checked) => onValueChange(checked ? true : undefined)}
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

function FilterControl<TData>({ filter, value, onValueChange }: FilterControlProps<TData>) {
  if (filter.type === 'text') {
    return <TextFilterControl filter={filter} value={value} onValueChange={onValueChange} />
  }
  if (filter.type === 'select') {
    return <SelectFilterControl filter={filter} value={value} onValueChange={onValueChange} />
  }
  return <BooleanFilterControl filter={filter} value={value} onValueChange={onValueChange} />
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

/**
 * A non-interactive panel row for columns that are always visible (locked).
 * Shows a lock icon in place of the drag handle and a muted check to signal
 * the column is permanently on. No toggle, no drag.
 */
function LockedColumnItem<TData>({ colName }: Pick<ColumnPanelItemProps<TData>, 'colName'>) {
  return (
    <div
      className={dataTableLockedColumnVariants()}
      aria-label={`${colName} column (always visible)`}
    >
      <span className="flex shrink-0 items-center justify-center rounded p-0.5">
        <Lock className="size-3.5" aria-hidden />
      </span>
      <span className="flex-1 select-none">{colName}</span>
      <Check className="size-3.5 shrink-0" aria-hidden />
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

  // Locked cols (meta.locked + enableHiding:false) appear in the panel but
  // cannot be hidden or dragged. Regular hideable cols participate in DnD.
  const allCols = table.getAllColumns()
  const lockedCols = allCols.filter((col) => Boolean(col.columnDef.meta?.locked))
  const hideableCols = allCols.filter((col) => col.getCanHide())

  function getColName(col: (typeof allCols)[number]): string {
    return (
      col.columnDef.meta?.label ??
      (typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id)
    )
  }

  const query = search.trim().toLowerCase()
  const filteredLockedCols = query
    ? lockedCols.filter((col) => getColName(col).toLowerCase().includes(query))
    : lockedCols
  const filteredHideableCols = query
    ? hideableCols.filter((col) => getColName(col).toLowerCase().includes(query))
    : hideableCols

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIds = hideableCols.map((c) => c.id)
    const oldIndex = oldIds.indexOf(String(active.id))
    const newIndex = oldIds.indexOf(String(over.id))
    const newOrder = arrayMove(oldIds, oldIndex, newIndex)

    // Build the full column order: select → locked/pinned → reordered → actions.
    // Non-hideable covers select, locked cols (image, name), and actions.
    const nonHideable = allCols.filter((c) => !c.getCanHide()).map((c) => c.id)
    const fullOrder = [
      ...nonHideable.filter((id) => id === 'select'),
      ...nonHideable.filter((id) => id !== 'select' && id !== 'actions'),
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

  const colIds = filteredHideableCols.map((c) => c.id)

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

          {/* Column list: locked (non-interactive) + sortable (DnD) */}
          <div className="max-h-[320px] overflow-y-auto">
            {/* Locked columns — always visible, cannot be hidden or reordered */}
            {filteredLockedCols.length > 0 && (
              <div className="py-1">
                {filteredLockedCols.map((col) => (
                  <LockedColumnItem key={col.id} colName={getColName(col)} />
                ))}
              </div>
            )}
            {filteredLockedCols.length > 0 && filteredHideableCols.length > 0 && (
              <div className="border-t border-border" />
            )}

            {/* Sortable columns */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={colIds} strategy={verticalListSortingStrategy}>
                <div className="py-1">
                  {filteredHideableCols.length > 0 ? (
                    filteredHideableCols.map((col) => (
                      <ColumnPanelItem key={col.id} col={col} colName={getColName(col)} />
                    ))
                  ) : filteredLockedCols.length === 0 ? (
                    <p className={dataTableEmptyPanelVariants()}>No columns found.</p>
                  ) : null}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Reset */}
          <div className="border-t border-border px-1 py-1.5">
            <button type="button" onClick={handleReset} className={dataTableResetColumnVariants()}>
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
  primaryFilters: FilterDef<TData>[]
  secondaryFilterCount: number
  activeSecondaryCount: number
  advancedOpen: boolean
  onToggleAdvanced: () => void
  onColumnChange?: (state: ColumnChangeState) => void
  filterNotice?: React.ReactNode
  columnFilters: ColumnFiltersState
  onFilterValueChange: (filterId: string, value: unknown, filter: FilterDef<TData>) => void
}

function DataTableToolbar<TData>({
  table,
  primaryFilters,
  secondaryFilterCount,
  activeSecondaryCount,
  advancedOpen,
  onToggleAdvanced,
  onColumnChange,
  filterNotice,
  columnFilters,
  onFilterValueChange,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex flex-col gap-2">
      <div className={dataTableToolbarVariants()}>
        {/* Primary filters */}
        <div className={dataTableFilterGroupVariants()}>
          {primaryFilters.map((filter) => (
            <FilterControl
              key={filter.id}
              filter={filter}
              value={getEffectiveFilterValue(filter, columnFilters)}
              onValueChange={(value) => onFilterValueChange(filter.id, value, filter)}
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
                <Badge appearance="neutral" tone="neutral" size="sm" className="ml-0.5">
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

      {filterNotice ? <div className={dataTableFilterNoticeVariants()}>{filterNotice}</div> : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DataTableAdvancedFilters
// ---------------------------------------------------------------------------

interface DataTableAdvancedFiltersProps<TData> {
  secondaryFilters: FilterDef<TData>[]
  open: boolean
  hasActiveFilters: boolean
  onClearAll: () => void
  columnFilters: ColumnFiltersState
  onFilterValueChange: (filterId: string, value: unknown, filter: FilterDef<TData>) => void
}

function DataTableAdvancedFilters<TData>({
  secondaryFilters,
  open,
  hasActiveFilters,
  onClearAll,
  columnFilters,
  onFilterValueChange,
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
                value={getEffectiveFilterValue(filter, columnFilters)}
                onValueChange={(value) => onFilterValueChange(filter.id, value, filter)}
              />
            ))}
          </div>
          {hasActiveFilters && (
            <div className="flex items-center justify-end border-t border-border px-4 py-2">
              <button type="button" onClick={onClearAll} className={dataTableFilterChipVariants()}>
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
  const sorted = column.getIsSorted()

  const sortIcon =
    sorted === 'asc' ? (
      <ChevronUp className={dataTableSortIconVariants({ state: 'asc' })} aria-hidden="true" />
    ) : sorted === 'desc' ? (
      <ChevronDown className={dataTableSortIconVariants({ state: 'desc' })} aria-hidden="true" />
    ) : (
      <ArrowUpDown className={dataTableSortIconVariants({ state: 'idle' })} aria-hidden="true" />
    )

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-7 data-[state=open]:bg-accent"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      aria-label={ariaLabel}
    >
      {children}
      {sortIcon}
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
// NameCell — semibold primary label for identity columns
// ---------------------------------------------------------------------------

export interface NameCellProps {
  children: React.ReactNode
}

export function NameCell({ children }: NameCellProps) {
  return <span className={dataTableNameCellVariants()}>{children}</span>
}

export interface DataTableImageCellProps {
  src: string
  alt?: string
}

/** Catalog overview thumbnail — pairs with `dataTableWidthMeta('image')`. */
export function DataTableImageCell({ src, alt = '' }: DataTableImageCellProps) {
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={alt === '' ? true : undefined}
      className={dataTableImageVariants()}
    />
  )
}

// ---------------------------------------------------------------------------
// TableBadgeCell — compact badge for source/status columns
// ---------------------------------------------------------------------------

export interface TableBadgeCellProps {
  appearance?: BadgeAppearance
  tone?: BadgeTone
  children: React.ReactNode
}

export function TableBadgeCell({
  appearance = 'neutral',
  tone = 'neutral',
  children,
}: TableBadgeCellProps) {
  return (
    <Badge size="sm" appearance={appearance} tone={tone}>
      {children}
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// RowActionsMenu — standard ellipsis actions menu for table rows
// ---------------------------------------------------------------------------

export interface RowActionsMenuLinkProps {
  href: string
  className?: string
  children: React.ReactNode
}

export interface RowActionsMenuProps {
  /** Target path for the edit route. */
  editHref: string
  /**
   * Router-aware link component for in-app navigation (e.g. React Router `Link`).
   * Receives `href` as the navigation target. Defaults to a plain `<a>`.
   */
  EditLink?: React.ComponentType<RowActionsMenuLinkProps>
  /** Primary navigation action label. Defaults to "Edit". */
  editLabel?: string
  /** Whether this item is currently active in the campaign. */
  enabled?: boolean
  /** Called with the new boolean when the active-in-campaign toggle changes. */
  onToggleEnabled?: (enabled: boolean) => void
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
  /** Optional footer section rendered below actions — e.g. campaign availability editor. */
  footer?: React.ReactNode
  /** Ref for the ellipsis trigger — used by orchestrators for focus restoration. */
  triggerRef?: React.Ref<HTMLButtonElement>
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
  EditLink: EditLinkComponent,
  editLabel = 'Edit',
  enabled,
  onToggleEnabled,
  enabledLabel = 'Active in campaign',
  enabledTooltip = 'Hides this item from players in the current campaign. The item remains available globally.',
  itemLabel = 'item',
  footer,
  triggerRef,
}: RowActionsMenuProps) {
  const editAction = (
    <>
      <Pencil />
      {editLabel}
    </>
  )

  const showLegacyToggle =
    footer === undefined && enabled !== undefined && onToggleEnabled !== undefined

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          variant="ghost"
          size="sm"
          className="size-8 p-0"
          aria-label={`Open actions for this ${itemLabel}`}
        >
          <Ellipsis className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuItem asChild className="text-xs [&_svg]:size-3">
          {EditLinkComponent ? (
            <EditLinkComponent href={editHref}>{editAction}</EditLinkComponent>
          ) : (
            <a href={editHref}>{editAction}</a>
          )}
        </DropdownMenuItem>
        {footer ? (
          <>
            <DropdownMenuSeparator />
            {footer}
          </>
        ) : null}
        {showLegacyToggle ? (
          <>
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
          </>
        ) : null}
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
  columnFilters: columnFiltersProp,
  onColumnFiltersChange,
  defaultColumnFilters,
  rowActions,
  enableRowSelection = false,
  onRowSelectionChange,
  defaultPageSize = 20,
  caption,
  onColumnChange,
  filterNotice,
  emptyState,
  getRowClassName,
  getCellClassName,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [uncontrolledColumnFilters, setUncontrolledColumnFilters] =
    React.useState<ColumnFiltersState>(
      defaultColumnFilters ?? buildDefaultColumnFilters<TData>(filters),
    )
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const [advancedOpen, setAdvancedOpen] = React.useState(false)

  const isColumnFiltersControlled = columnFiltersProp !== undefined
  const columnFilters = isColumnFiltersControlled ? columnFiltersProp : uncontrolledColumnFilters

  const setColumnFilters = React.useCallback(
    (updater: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => {
      const next = typeof updater === 'function' ? updater(columnFilters) : updater
      onColumnFiltersChange?.(next)
      if (!isColumnFiltersControlled) {
        setUncontrolledColumnFilters(next)
      }
    },
    [columnFilters, isColumnFiltersControlled, onColumnFiltersChange],
  )

  const externallyFilteredData = React.useMemo(
    () => applyExternalFilters(data, filters, columnFilters),
    [columnFilters, data, filters],
  )

  const columnBackedFilters = React.useMemo(
    () =>
      columnFilters.filter((entry) => {
        const filter = filters.find((candidate) => candidate.id === entry.id)
        return filter === undefined || filter.matches === undefined
      }),
    [columnFilters, filters],
  )

  // Warn in dev when a filter id doesn't match any column accessorKey
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    const columnIds = new Set(columns.map((c) => (c as { accessorKey?: string }).accessorKey ?? ''))
    for (const f of filters) {
      if (f.matches) continue
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
  React.useEffect(() => {
    onColumnChangeRef.current = onColumnChange
  })
  React.useEffect(() => {
    onColumnChangeRef.current?.({
      visibility: columnVisibility,
      order: columnOrder,
    })
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
    meta: { ...dataTableWidthMeta('minimal'), columnTone: 'neutral' },
  }

  // Inject actions column
  const actionsColumn: ColumnDef<TData> = {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => rowActions?.(row.original) ?? null,
    enableSorting: false,
    enableHiding: false,
    meta: { ...dataTableWidthMeta('minimal'), columnTone: 'actions' },
  }

  const resolvedColumns: ColumnDef<TData>[] = [
    ...(enableRowSelection ? [selectionColumn] : []),
    ...columns,
    ...(rowActions ? [actionsColumn] : []),
  ]

  // TanStack Table returns unstable function references; intentional here.
  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data: externallyFilteredData,
    columns: resolvedColumns,
    state: {
      sorting,
      columnFilters: columnBackedFilters,
      columnVisibility,
      columnOrder,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
      const next = typeof updater === 'function' ? updater(columnBackedFilters) : updater
      setColumnFilters((prev) => {
        const externalEntries = prev.filter((entry) =>
          filters.some((filter) => filter.id === entry.id && filter.matches),
        )
        return [...externalEntries, ...next]
      })
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

  const activeSecondaryCount = secondaryFilters.filter((filter) =>
    isFilterActive(filter, columnFilters),
  ).length

  const hasAnyActiveFilter = filters.some((filter) => isFilterActive(filter, columnFilters))

  function clearAllFilters() {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setColumnFilters(buildDefaultColumnFilters(filters))
    table.resetColumnFilters()
  }

  function handleFilterValueChange(filterId: string, value: unknown, filter: FilterDef<TData>) {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    setColumnFilters((prev) => setFilterValueInState(prev, filterId, value, filter))
  }

  const rows = table.getRowModel().rows
  const emptyStateContext: DataTableEmptyStateContext<TData> = {
    columnFilters,
    filteredRowCount: rows.length,
    totalRowCount: externallyFilteredData.length,
    data: externallyFilteredData,
  }

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
        filterNotice={filterNotice}
        columnFilters={columnFilters}
        onFilterValueChange={handleFilterValueChange}
      />

      {/* Advanced filters panel */}
      <DataTableAdvancedFilters
        secondaryFilters={secondaryFilters}
        open={advancedOpen}
        hasActiveFilters={hasAnyActiveFilter}
        onClearAll={clearAllFilters}
        columnFilters={columnFilters}
        onFilterValueChange={handleFilterValueChange}
      />

      {/* Table */}
      <div className={dataTableTableWrapVariants()}>
        <Table className={dataTableTableVariants()}>
          {caption && <TableCaption className={dataTableCaptionVariants()}>{caption}</TableCaption>}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className={dataTableHeaderRowVariants()}>
                {headerGroup.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  const canSort = header.column.getCanSort()
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        dataTableHeaderCellVariants(),
                        header.column.columnDef.meta?.headerClassName,
                      )}
                      aria-sort={
                        sorted === 'asc'
                          ? 'ascending'
                          : sorted === 'desc'
                            ? 'descending'
                            : canSort
                              ? 'none'
                              : undefined
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(dataTableRowVariants(), getRowClassName?.(row))}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          dataTableBodyCellVariants({
                            tone: meta?.columnTone ?? 'neutral',
                          }),
                          dataTableBodyCellPaddingVariants(),
                          meta?.cellClassName,
                          getCellClassName?.(cell),
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={resolvedColumns.length}
                  className={dataTableEmptyStateVariants()}
                >
                  {emptyState ? emptyState(emptyStateContext) : 'No results.'}
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
