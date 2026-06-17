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
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, ChevronUp, Columns3, Filter, X } from 'lucide-react'

import { Button } from './button.client'
import { Checkbox } from './checkbox.client'
import { Collapsible, CollapsibleContent } from './collapsible.client'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu.client'
import { Input } from './input.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
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
  DataTableProps,
  FilterDef,
  SelectFilterDef,
  TextFilterDef,
} from './data-table.types'
import {
  dataTableAdvancedInnerVariants,
  dataTableAdvancedPanelVariants,
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
// DataTableToolbar
// ---------------------------------------------------------------------------

interface DataTableToolbarProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  primaryFilters: FilterDef[]
  secondaryFilterCount: number
  activeSecondaryCount: number
  advancedOpen: boolean
  onToggleAdvanced: () => void
}

function DataTableToolbar<TData>({
  table,
  primaryFilters,
  secondaryFilterCount,
  activeSecondaryCount,
  advancedOpen,
  onToggleAdvanced,
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

        {/* Column visibility toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Columns3 className="size-3.5" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.getIsVisible()}
                  onCheckedChange={(v) => col.toggleVisibility(!!v)}
                  className="capitalize"
                >
                  {typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
}

export function SortableHeader<TData, TValue>({
  column,
  children,
}: SortableHeaderProps<TData, TValue>) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      aria-label={`Sort by ${children?.toString()}`}
    >
      {children}
      <ArrowUpDown className="ml-1 size-3.5 opacity-50" />
    </Button>
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
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
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
    state: { sorting, columnFilters, columnVisibility, rowSelection, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      // Reset to first page whenever filters change
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
      setColumnFilters(updater)
    },
    onColumnVisibilityChange: setColumnVisibility,
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
                  <TableHead key={header.id} colSpan={header.colSpan}>
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
                    <TableCell key={cell.id}>
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
