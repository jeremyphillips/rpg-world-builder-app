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
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronUp,
  Columns3,
  Ellipsis,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu.client'
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
import {
  areColumnOrdersEqual,
  areVisibilityStatesEqual,
  createColumnChangeSnapshot,
  createPersistedColumnChangeState,
} from './data-table-column-change.lib'
import type {
  ColumnChangeState,
  DataTableEmptyStateContext,
  DataTableProps,
} from './data-table.types'
import {
  dataTableBodyCellPaddingVariants,
  dataTableBodyCellVariants,
  dataTableCaptionVariants,
  dataTableColumnDragHandleVariants,
  dataTableColumnItemVariants,
  dataTableColumnPanelVariants,
  dataTableEmptyPanelVariants,
  dataTableEmptyStateVariants,
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
// Legacy column filter functions (column defs may still declare filterFn)
// ---------------------------------------------------------------------------

const booleanFilterFn: FilterFn<unknown> = (row, columnId) => Boolean(row.getValue(columnId))
booleanFilterFn.autoRemove = (val: unknown) => !val

const equalsStringFilterFn: FilterFn<unknown> = (row, columnId, filterValue) =>
  String(row.getValue(columnId)) === String(filterValue)
equalsStringFilterFn.autoRemove = (val: unknown) => val == null || val === ''

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

const POINTER_SENSOR_ACTIVATION_DISTANCE_PX = 8

function DataTableColumnPanel<TData>({ table, onColumnChange }: DataTableColumnPanelProps<TData>) {
  const [search, setSearch] = React.useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: POINTER_SENSOR_ACTIVATION_DISTANCE_PX },
    }),
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
  rowActions,
  enableRowSelection = false,
  onRowSelectionChange,
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
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
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

  // Inject selection column
  const selectionColumn = React.useMemo<ColumnDef<TData>>(
    () => ({
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
    }),
    [],
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

  // TanStack Table returns unstable function references; intentional here.
  // eslint-disable-next-line react-hooks/incompatible-library -- useReactTable
  const table = useReactTable({
    data,
    columns: resolvedColumns,
    state: {
      sorting,
      columnVisibility,
      ...(columnOrder.length > 0 ? { columnOrder } : {}),
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: { boolean: booleanFilterFn, equalsString: equalsStringFilterFn },
    enableRowSelection,
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

  const rows = table.getRowModel().rows
  const emptyStateContext: DataTableEmptyStateContext<TData> = {
    filteredRowCount: rows.length,
    totalRowCount: data.length,
    data,
  }

  return (
    <div className={dataTableRootVariants()}>
      <DataTableToolbar table={table} onColumnChange={onColumnChange} />

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
      <DataTablePagination table={table} onPageSizeChange={handlePageSizeChange} />
    </div>
  )
}
