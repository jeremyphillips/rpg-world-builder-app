'use client'

// Allow column defs to pass className overrides through meta, and recognise
// legacy filter function names on column definitions.
declare module '@tanstack/react-table' {
  interface FilterFns {
    boolean: FilterFn<unknown>
    equalsString: FilterFn<unknown>
  }
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
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnOrderState,
  type FilterFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { ArrowUpDown, Check, ChevronDown, ChevronUp, Ellipsis, X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { Checkbox } from './checkbox.client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
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
import {
  areColumnOrdersEqual,
  areVisibilityStatesEqual,
  createColumnChangeSnapshot,
  createPersistedColumnChangeState,
  resolveDataTableColumnOrder,
} from './data-table-column-change.lib'
import {
  DataTableColumnsMenu,
  type DataTableColumnsMenuItem,
} from './data-table-columns-menu.client'
import type {
  ColumnChangeState,
  DataTableColumnVisibilityTriggerProps,
  DataTableEmptyStateContext,
  DataTableProps,
  DataTableSelectionLabels,
  DataTableUtilityControls,
} from './data-table.types'
import {
  dataTableBodyCellPaddingVariants,
  dataTableBodyCellVariants,
  dataTableCaptionVariants,
  dataTableEmptyStateVariants,
  dataTablePaginationVariants,
  dataTableRowVariants,
  dataTableSortIconVariants,
  dataTableHeaderCellVariants,
  dataTableHeaderRowVariants,
  dataTableImageVariants,
  dataTableNameCellVariants,
  dataTableRootVariants,
  dataTableTableVariants,
  dataTableTableWrapVariants,
  dataTableToolbarVariants,
  dataTableUtilityStripVariants,
} from './data-table.variants'
import { arrayMove } from '@dnd-kit/sortable'

// ---------------------------------------------------------------------------
// Legacy column filter functions (column defs may still declare filterFn)
// ---------------------------------------------------------------------------

const booleanFilterFn: FilterFn<unknown> = (row, columnId) => Boolean(row.getValue(columnId))
booleanFilterFn.autoRemove = (val: unknown) => !val

const equalsStringFilterFn: FilterFn<unknown> = (row, columnId, filterValue) =>
  String(row.getValue(columnId)) === String(filterValue)
equalsStringFilterFn.autoRemove = (val: unknown) => val == null || val === ''

// ---------------------------------------------------------------------------
// DataTableColumnVisibilityTrigger — adapts TanStack table state to ColumnsMenu
// ---------------------------------------------------------------------------

interface DataTableColumnVisibilityPanelProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  onColumnChange?: (state: ColumnChangeState) => void
}

function getColumnDisplayName<TData>(col: Column<TData>): string {
  return (
    col.columnDef.meta?.label ??
    (typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id)
  )
}

function buildColumnsMenuItems<TData>(
  table: ReturnType<typeof useReactTable<TData>>,
): DataTableColumnsMenuItem[] {
  return table.getAllColumns().map((col) => ({
    id: col.id,
    label: getColumnDisplayName(col),
    visible: col.getIsVisible(),
    canHide: col.getCanHide(),
    canReorder: col.getCanHide(),
    lockedReason: col.columnDef.meta?.locked ? 'This column is always visible' : undefined,
  }))
}

type DataTableColumnVisibilityTriggerInternalProps<TData> = DataTableColumnVisibilityTriggerProps &
  DataTableColumnVisibilityPanelProps<TData>

/** Column visibility popover trigger — icon-only or labeled outline button. */
export function DataTableColumnVisibilityTrigger<TData>({
  table,
  onColumnChange,
  'aria-label': ariaLabel = 'Choose visible columns',
  showLabel = false,
}: DataTableColumnVisibilityTriggerInternalProps<TData>) {
  const items = buildColumnsMenuItems(table)
  const allCols = table.getAllColumns()
  const hideableCols = allCols.filter((col) => col.getCanHide())

  function handleVisibilityChange(id: string, visible: boolean) {
    table.getColumn(id)?.toggleVisibility(visible)
    onColumnChange?.(
      createPersistedColumnChangeState(
        table.getState().columnVisibility,
        table.getState().columnOrder,
      ),
    )
  }

  function handleReorder(activeId: string, overId: string) {
    const oldIds = hideableCols.map((col) => col.id)
    const oldIndex = oldIds.indexOf(activeId)
    const newIndex = oldIds.indexOf(overId)
    const newOrder = arrayMove(oldIds, oldIndex, newIndex)

    const nonHideable = allCols.filter((col) => !col.getCanHide()).map((col) => col.id)
    const fullOrder = [
      ...nonHideable.filter((id) => id === 'select'),
      ...nonHideable.filter((id) => id !== 'select' && id !== 'actions'),
      ...newOrder,
      ...nonHideable.filter((id) => id === 'actions'),
    ]

    table.setColumnOrder(fullOrder)
    onColumnChange?.(
      createPersistedColumnChangeState(
        table.getState().columnVisibility,
        table.getState().columnOrder,
      ),
    )
  }

  function handleReset() {
    table.setColumnOrder([])
    table.resetColumnVisibility()
    onColumnChange?.({ visibility: {}, order: [] })
  }

  return (
    <DataTableColumnsMenu
      items={items}
      onVisibilityChange={handleVisibilityChange}
      onReorder={handleReorder}
      onReset={handleReset}
      triggerVariant={showLabel ? 'labeled' : 'compact'}
      labels={{ chooseColumns: ariaLabel }}
    />
  )
}

function DataTableColumnPanel<TData>({
  table,
  onColumnChange,
}: DataTableColumnVisibilityPanelProps<TData>) {
  return (
    <DataTableColumnVisibilityTrigger
      table={table}
      onColumnChange={onColumnChange}
      showLabel
      aria-label="Columns"
    />
  )
}

// ---------------------------------------------------------------------------
// DataTableToolbar
// ---------------------------------------------------------------------------

interface DataTableToolbarProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  onColumnChange?: (state: ColumnChangeState) => void
}

function DataTableToolbar<TData>({ table, onColumnChange }: DataTableToolbarProps<TData>) {
  return (
    <div className={dataTableToolbarVariants()}>
      <div className="flex-1" />
      <DataTableColumnPanel table={table} onColumnChange={onColumnChange} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// DataTablePagination
// ---------------------------------------------------------------------------

interface DataTablePaginationProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  onPageSizeChange: (pageSize: number) => void
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const

function DataTablePagination<TData>({ table, onPageSizeChange }: DataTablePaginationProps<TData>) {
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
        <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
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

export type RowActionMenuItem =
  | {
      kind: 'link'
      id: string
      label: string
      href: string
      icon?: React.ReactNode
      destructive?: boolean
      disabled?: boolean
      disabledReason?: string
      separatorBefore?: boolean
    }
  | {
      kind: 'action'
      id: string
      label: string
      onSelect: () => void
      icon?: React.ReactNode
      destructive?: boolean
      disabled?: boolean
      disabledReason?: string
      separatorBefore?: boolean
    }

export interface RowActionsMenuProps {
  items: RowActionMenuItem[]
  /** Router-aware link component for `kind: 'link'` items. Defaults to a plain `<a>`. */
  LinkComponent?: React.ComponentType<RowActionsMenuLinkProps>
  /** Optional footer section rendered below actions — e.g. campaign availability editor. */
  footer?: React.ReactNode
  /** Accessible label for the ellipsis trigger button. */
  triggerLabel: string
  /** Ghost icon trigger for table rows; outline icon for page overflow menus. */
  triggerVariant?: 'ghost-icon' | 'outline-icon'
  /** Disables the trigger while a row action mutation is pending. */
  disabled?: boolean
  /** Dropdown content width utility classes. */
  contentClassName?: string
  /** Ref for the ellipsis trigger — used by orchestrators for focus restoration. */
  triggerRef?: React.Ref<HTMLButtonElement>
}

function rowActionItemClassName(destructive?: boolean): string {
  return cn('text-xs [&_svg]:size-3', destructive && 'text-destructive focus:text-destructive')
}

function RowActionMenuItemContent({
  icon,
  label,
  disabledReason,
}: {
  icon?: React.ReactNode
  label: string
  disabledReason?: string
}) {
  return (
    <>
      {icon}
      <span className="flex min-w-0 flex-1 items-center gap-1">
        <span className="truncate">{label}</span>
        {disabledReason ? (
          <InfoTooltip aria-label={`Why ${label} is unavailable`}>{disabledReason}</InfoTooltip>
        ) : null}
      </span>
    </>
  )
}

/**
 * Pre-built row actions dropdown for the `rowActions` prop and card row menus.
 *
 * Renders an ellipsis trigger that opens a menu of link and callback actions.
 * Feature code owns item availability, confirms, and mutations; this primitive
 * owns trigger chrome, layout, separators, and disabled explanations.
 */
export function RowActionsMenu({
  items,
  LinkComponent,
  footer,
  triggerLabel,
  triggerVariant = 'ghost-icon',
  disabled = false,
  contentClassName = 'w-48',
  triggerRef,
}: RowActionsMenuProps) {
  const triggerClassName = triggerVariant === 'outline-icon' ? undefined : 'size-8 p-0'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={triggerRef}
          variant={triggerVariant === 'outline-icon' ? 'outline' : 'ghost'}
          size="sm"
          className={triggerClassName}
          aria-label={triggerLabel}
          disabled={disabled}
        >
          <Ellipsis className="size-4" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={contentClassName}>
        {items.map((item) => {
          const itemClassName = rowActionItemClassName(item.destructive)
          const content = (
            <RowActionMenuItemContent
              icon={item.icon}
              label={item.label}
              disabledReason={item.disabled ? item.disabledReason : undefined}
            />
          )

          return (
            <React.Fragment key={item.id}>
              {item.separatorBefore ? <DropdownMenuSeparator /> : null}
              {item.kind === 'link' ? (
                item.disabled ? (
                  <DropdownMenuItem className={itemClassName} disabled>
                    {content}
                  </DropdownMenuItem>
                ) : LinkComponent ? (
                  <DropdownMenuItem asChild className={itemClassName}>
                    <LinkComponent href={item.href}>{content}</LinkComponent>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild className={itemClassName}>
                    <a href={item.href}>{content}</a>
                  </DropdownMenuItem>
                )
              ) : (
                <DropdownMenuItem
                  className={itemClassName}
                  disabled={item.disabled}
                  onSelect={() => item.onSelect()}
                >
                  {content}
                </DropdownMenuItem>
              )}
            </React.Fragment>
          )
        })}
        {footer ? (
          <>
            {items.length > 0 ? <DropdownMenuSeparator /> : null}
            {footer}
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
  rowActions,
  enableRowSelection = false,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  onRowSelectionStateChange,
  selectionLabels,
  getRowId: getRowIdProp,
  getRowCanSelect,
  rowSelectionDescribedBy,
  utilityStrip,
  defaultPageSize = 20,
  initialColumnVisibility,
  initialColumnOrder,
  caption,
  onColumnChange,
  emptyState,
  getRowClassName,
  getCellClassName,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibilityState] = React.useState<VisibilityState>(
    initialColumnVisibility ?? {},
  )
  const [columnOrder, setColumnOrderState] = React.useState<ColumnOrderState>(
    initialColumnOrder ?? [],
  )
  const [uncontrolledRowSelection, setUncontrolledRowSelection] = React.useState<RowSelectionState>(
    {},
  )
  const rowSelection = rowSelectionProp ?? uncontrolledRowSelection
  const [pagination, setPaginationState] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const setPagination = React.useCallback(
    (updater: PaginationState | ((prev: PaginationState) => PaginationState)) => {
      setPaginationState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (prev.pageIndex === next.pageIndex && prev.pageSize === next.pageSize) return prev
        return next
      })
    },
    [],
  )

  // Notify parent when column visibility/order changes — explicit writes only.
  const onColumnChangeRef = React.useRef(onColumnChange)
  React.useEffect(() => {
    onColumnChangeRef.current = onColumnChange
  })
  const columnVisibilityRef = React.useRef(columnVisibility)
  const columnOrderRef = React.useRef(columnOrder)
  columnVisibilityRef.current = columnVisibility
  columnOrderRef.current = columnOrder
  const lastNotifiedColumnStateRef = React.useRef<string | null>(null)

  const notifyColumnChange = React.useCallback(() => {
    if (!onColumnChangeRef.current) return

    const next = createPersistedColumnChangeState(
      columnVisibilityRef.current,
      columnOrderRef.current,
    )
    const snapshot = createColumnChangeSnapshot(next)
    if (snapshot === lastNotifiedColumnStateRef.current) return

    lastNotifiedColumnStateRef.current = snapshot
    onColumnChangeRef.current(next)
  }, [])

  const setColumnVisibility = React.useCallback(
    (updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => {
      setColumnVisibilityState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (areVisibilityStatesEqual(prev, next)) return prev

        queueMicrotask(notifyColumnChange)
        return next
      })
    },
    [notifyColumnChange],
  )

  const setColumnOrder = React.useCallback(
    (updater: ColumnOrderState | ((prev: ColumnOrderState) => ColumnOrderState)) => {
      setColumnOrderState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        if (areColumnOrdersEqual(prev, next)) return prev

        queueMicrotask(notifyColumnChange)
        return next
      })
    },
    [notifyColumnChange],
  )

  const handleRowSelectionChange = React.useCallback(
    (updater: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater
      if (rowSelectionProp === undefined) {
        setUncontrolledRowSelection(next)
      }
      onRowSelectionStateChange?.(next)
    },
    [onRowSelectionStateChange, rowSelection, rowSelectionProp],
  )

  const selectionLabelsRef = React.useRef<DataTableSelectionLabels<TData> | undefined>(
    selectionLabels,
  )
  selectionLabelsRef.current = selectionLabels

  const resolveSelectAllLabel = React.useCallback((pageRowCount: number) => {
    const label = selectionLabelsRef.current?.selectAll
    if (typeof label === 'function') return label(pageRowCount)
    if (typeof label === 'string') return label
    return 'Select all rows on this page'
  }, [])

  const getRowCanSelectRef = React.useRef(getRowCanSelect)
  getRowCanSelectRef.current = getRowCanSelect

  const resolveRowSelectionEnabled = React.useCallback(
    (row: { original: TData; getCanSelect: () => boolean }) => {
      if (!getRowCanSelectRef.current) return true
      return getRowCanSelectRef.current(row.original)
    },
    [],
  )

  const getRowId = React.useCallback(
    (row: TData, index: number) => {
      if (getRowIdProp) return getRowIdProp(row)
      const candidate = (row as { id?: string }).id
      return candidate ?? String(index)
    },
    [getRowIdProp],
  )

  // Inject selection column
  const selectionColumn = React.useMemo<ColumnDef<TData>>(
    () => ({
      id: 'select',
      header: ({ table: headerTable }) => {
        const pageRowCount = headerTable.getRowModel().rows.length
        return (
          <Checkbox
            checked={
              headerTable.getIsAllPageRowsSelected() ||
              (headerTable.getIsSomePageRowsSelected() ? 'indeterminate' : false)
            }
            onCheckedChange={(v) => headerTable.toggleAllPageRowsSelected(!!v)}
            aria-label={resolveSelectAllLabel(pageRowCount)}
          />
        )
      },
      cell: ({ row }) => {
        const canSelect = row.getCanSelect()
        return (
          <Checkbox
            checked={row.getIsSelected()}
            disabled={!canSelect}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label={selectionLabelsRef.current?.selectRow?.(row.original) ?? 'Select row'}
            aria-describedby={!canSelect ? rowSelectionDescribedBy : undefined}
          />
        )
      },
      enableSorting: false,
      enableHiding: false,
      meta: { ...dataTableWidthMeta('select'), columnTone: 'neutral' },
    }),
    [resolveSelectAllLabel, rowSelectionDescribedBy],
  )

  // Inject actions column
  const actionsColumn = React.useMemo<ColumnDef<TData>>(
    () => ({
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => rowActions?.(row.original) ?? null,
      enableSorting: false,
      enableHiding: false,
      meta: {
        ...dataTableWidthMeta('actions'),
        columnTone: 'actions',
        label: 'Actions',
        locked: true,
      },
    }),
    [rowActions],
  )

  const resolvedColumns = React.useMemo<ColumnDef<TData>[]>(
    () => [
      ...(enableRowSelection ? [selectionColumn] : []),
      ...columns,
      ...(rowActions ? [actionsColumn] : []),
    ],
    [actionsColumn, columns, enableRowSelection, rowActions, selectionColumn],
  )

  const effectiveColumnOrder = React.useMemo(
    () =>
      resolveDataTableColumnOrder({
        order: columnOrder,
        enableRowSelection: Boolean(enableRowSelection),
        hasActions: Boolean(rowActions),
      }),
    [columnOrder, enableRowSelection, rowActions],
  )

  // TanStack Table returns unstable function references; intentional here.
  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data,
    columns: resolvedColumns,
    getRowId,
    state: {
      sorting,
      columnVisibility,
      ...(effectiveColumnOrder.length > 0 ? { columnOrder: effectiveColumnOrder } : {}),
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onRowSelectionChange: handleRowSelectionChange,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: { boolean: booleanFilterFn, equalsString: equalsStringFilterFn },
    enableRowSelection: enableRowSelection ? (row) => resolveRowSelectionEnabled(row) : false,
  })

  const tableRef = React.useRef(table)
  tableRef.current = table

  const handlePageSizeChange = React.useCallback((nextSize: number) => {
    const currentSize = tableRef.current.getState().pagination.pageSize
    if (nextSize === currentSize) return
    tableRef.current.setPageSize(nextSize)
  }, [])

  const onRowSelectionChangeRef = React.useRef(onRowSelectionChange)
  onRowSelectionChangeRef.current = onRowSelectionChange

  // Notify parent of selection changes
  React.useEffect(() => {
    onRowSelectionChangeRef.current?.(
      tableRef.current.getSelectedRowModel().rows.map((r) => r.original),
    )
  }, [rowSelection])

  const utilityControls = React.useMemo<DataTableUtilityControls<TData>>(
    () => ({
      ColumnVisibilityTrigger: (triggerProps) => (
        <DataTableColumnVisibilityTrigger
          table={tableRef.current}
          onColumnChange={onColumnChange}
          {...triggerProps}
        />
      ),
      pageRowCount: table.getRowModel().rows.length,
      pageSelectableRowCount: table.getRowModel().rows.filter((row) => row.getCanSelect()).length,
      isAllPageRowsSelected: table.getIsAllPageRowsSelected(),
      isSomePageRowsSelected: table.getIsSomePageRowsSelected(),
      toggleAllPageRowsSelected: (value) => table.toggleAllPageRowsSelected(value),
      selectedRowCount: table.getSelectedRowModel().rows.length,
      selectedRows: table.getSelectedRowModel().rows.map((row) => row.original),
      clearRowSelection: () => table.resetRowSelection(),
    }),
    [
      onColumnChange,
      rowSelection,
      table,
      pagination.pageIndex,
      pagination.pageSize,
      data.length,
      enableRowSelection,
      getRowCanSelect,
    ],
  )

  const rows = table.getRowModel().rows
  const emptyStateContext: DataTableEmptyStateContext<TData> = {
    filteredRowCount: rows.length,
    totalRowCount: data.length,
    data,
  }

  const tableElement = (
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
            <TableCell colSpan={resolvedColumns.length} className={dataTableEmptyStateVariants()}>
              {emptyState ? emptyState(emptyStateContext) : 'No results.'}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )

  return (
    <div className={dataTableRootVariants()}>
      {utilityStrip ? (
        <div className={dataTableTableWrapVariants()}>
          <div className={dataTableUtilityStripVariants()}>{utilityStrip(utilityControls)}</div>
          {tableElement}
        </div>
      ) : (
        <>
          <DataTableToolbar table={table} onColumnChange={onColumnChange} />
          <div className={dataTableTableWrapVariants()}>{tableElement}</div>
        </>
      )}

      {/* Pagination */}
      <DataTablePagination table={table} onPageSizeChange={handlePageSizeChange} />
    </div>
  )
}
