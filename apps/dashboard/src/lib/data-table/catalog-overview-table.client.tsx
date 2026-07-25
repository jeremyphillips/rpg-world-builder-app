'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  areColumnChangeStatesEqual,
  type ColumnChangeState,
  type ColumnDef,
  type DataTableEmptyStateContext,
  type DataTableProps,
  type DataTableUtilityControls,
} from '@rpg/ui'
import {
  FilterAdvancedPanel,
  FilterBar,
  FilterChromeProvider,
  applyFilterSchema,
  getSchemaFieldsByPlacement,
  useFilterState,
  type FilterFieldId,
  type FilterSchema,
} from '@rpg/ui/filters'

import { buildCatalogOverviewColumnSchema } from './catalog-overview-columns.lib'
import {
  CATALOG_OVERVIEW_PREFERENCES_DEFAULTS,
  hydrateCatalogOverviewPreferences,
  persistCatalogOverviewPreferences,
  type CatalogOverviewPageSize,
  type CatalogOverviewPreferences,
} from './catalog-overview-preferences'
import { formatCatalogResultCount } from './format-catalog-result-count.lib'
import { OverviewTableFrame } from './overview-table-frame.client'

type CatalogOverviewTableCoreProps<T extends { id: string }> = {
  tableKey: string
  columns: ColumnDef<T, unknown>[]
  data: T[]
  resultCountLabel?: string
  emptyState?: ReactNode | ((context: DataTableEmptyStateContext<T>) => ReactNode)
  caption?: string
  rowActions?: (row: T) => ReactNode
  getRowClassName?: DataTableProps<T>['getRowClassName']
  getCellClassName?: DataTableProps<T>['getCellClassName']
  filters?: ReactNode
}

type CatalogOverviewControlledFilterProps<T, TFilters extends Record<string, unknown>> = {
  filterSchema: FilterSchema<T, TFilters>
  filterState: TFilters
  onFilterChange: (
    id: FilterFieldId<TFilters>,
    value: TFilters[FilterFieldId<TFilters>] | undefined,
  ) => void
  onResetFilters: () => void
}

type CatalogOverviewInternalFilterProps<T, TFilters extends Record<string, unknown>> = {
  filterSchema: FilterSchema<T, TFilters>
  filterState?: never
  onFilterChange?: never
  onResetFilters?: never
}

type CatalogOverviewNoFilterProps = {
  filterSchema?: never
  filterState?: never
  onFilterChange?: never
  onResetFilters?: never
}

export type CatalogOverviewTableProps<
  T extends { id: string },
  TFilters extends Record<string, unknown> = Record<string, never>,
> = CatalogOverviewTableCoreProps<T> &
  (
    | CatalogOverviewControlledFilterProps<T, TFilters>
    | CatalogOverviewInternalFilterProps<T, TFilters>
    | CatalogOverviewNoFilterProps
  )

type CatalogOverviewTableBodyProps<T extends { id: string }> = {
  tableKey: string
  columns: ColumnDef<T, unknown>[]
  visibleRows: T[]
  resultCountLabel?: string
  emptyState?: ReactNode | ((context: DataTableEmptyStateContext<T>) => ReactNode)
  caption?: string
  rowActions?: (row: T) => ReactNode
  getRowClassName?: DataTableProps<T>['getRowClassName']
  getCellClassName?: DataTableProps<T>['getCellClassName']
  toolbar?: ReactNode
}

const COLUMNS_ARIA_LABEL = 'Choose visible columns'

function CatalogOverviewTableBody<T extends { id: string }>({
  tableKey,
  columns,
  visibleRows,
  resultCountLabel,
  emptyState,
  caption,
  rowActions,
  getRowClassName,
  getCellClassName,
  toolbar,
}: CatalogOverviewTableBodyProps<T>) {
  const columnSchema = useMemo(
    () => buildCatalogOverviewColumnSchema(columns as ColumnDef<unknown>[]),
    [columns],
  )
  const [preferences, setPreferences] = useState<CatalogOverviewPreferences>(() =>
    hydrateCatalogOverviewPreferences(tableKey, columnSchema),
  )

  const handleColumnChange = useCallback(
    (state: ColumnChangeState) => {
      setPreferences((current) => {
        const next = {
          ...current,
          columnVisibility: state.visibility,
          columnOrder: state.order,
        }

        if (
          areColumnChangeStatesEqual(
            {
              visibility: current.columnVisibility ?? {},
              order: current.columnOrder ?? [],
            },
            state,
          )
        ) {
          return current
        }

        persistCatalogOverviewPreferences(tableKey, next)
        return next
      })
    },
    [tableKey],
  )

  const resolvedResultCountLabel = resultCountLabel ?? formatCatalogResultCount(visibleRows.length)

  const tablePageSize: CatalogOverviewPageSize =
    preferences.pageSize ?? CATALOG_OVERVIEW_PREFERENCES_DEFAULTS.pageSize ?? 20

  const renderUtilityActions = useCallback(
    (controls: DataTableUtilityControls<T>) => (
      <controls.ColumnVisibilityTrigger aria-label={COLUMNS_ARIA_LABEL} showLabel={false} />
    ),
    [],
  )

  return (
    <OverviewTableFrame
      columns={columns}
      data={visibleRows}
      caption={caption}
      emptyState={emptyState}
      rowActions={rowActions}
      getRowClassName={getRowClassName}
      getCellClassName={getCellClassName}
      defaultPageSize={tablePageSize}
      initialColumnVisibility={preferences.columnVisibility}
      initialColumnOrder={preferences.columnOrder}
      onColumnChange={handleColumnChange}
      toolbar={toolbar}
      summary={<span className="text-sm text-muted-foreground">{resolvedResultCountLabel}</span>}
      utilityActions={renderUtilityActions}
    />
  )
}

type CatalogOverviewFilterChromeProps<T, TFilters extends Record<string, unknown>> = {
  filterSchema: FilterSchema<T, TFilters>
  filterState: TFilters
  onFilterChange: (
    id: FilterFieldId<TFilters>,
    value: TFilters[FilterFieldId<TFilters>] | undefined,
  ) => void
  onResetFilters: () => void
  advancedOpen: boolean
  onAdvancedOpenChange: (open: boolean) => void
}

function CatalogOverviewFilterChrome<T, TFilters extends Record<string, unknown>>({
  filterSchema,
  filterState,
  onFilterChange,
  onResetFilters,
  advancedOpen,
  onAdvancedOpenChange,
}: CatalogOverviewFilterChromeProps<T, TFilters>) {
  const hasAdvancedFields = useMemo(
    () => getSchemaFieldsByPlacement(filterSchema, 'advanced').length > 0,
    [filterSchema],
  )

  return (
    <FilterChromeProvider>
      <FilterBar
        schema={filterSchema}
        state={filterState}
        onValueChange={onFilterChange}
        onReset={onResetFilters}
        advancedOpen={advancedOpen}
        onAdvancedOpenChange={hasAdvancedFields ? onAdvancedOpenChange : undefined}
      />
      <FilterAdvancedPanel
        schema={filterSchema}
        state={filterState}
        onValueChange={onFilterChange}
        open={advancedOpen}
        onClearAll={onResetFilters}
      />
    </FilterChromeProvider>
  )
}

function CatalogOverviewTableWithInternalFilters<
  T extends { id: string },
  TFilters extends Record<string, unknown>,
>({
  tableKey,
  columns,
  data,
  filterSchema,
  filters,
  ...bodyProps
}: CatalogOverviewTableCoreProps<T> &
  CatalogOverviewInternalFilterProps<T, TFilters> & { filterSchema: FilterSchema<T, TFilters> }) {
  const columnSchema = useMemo(
    () => buildCatalogOverviewColumnSchema(columns as ColumnDef<unknown>[]),
    [columns],
  )
  const [preferences, setPreferences] = useState<CatalogOverviewPreferences>(() =>
    hydrateCatalogOverviewPreferences(tableKey, columnSchema),
  )
  const advancedOpen = preferences.advancedOpen ?? false
  const { state, setValue, reset } = useFilterState(filterSchema, { data })

  const visibleRows = useMemo(
    () => applyFilterSchema(filterSchema, state, data),
    [data, filterSchema, state],
  )

  const handleAdvancedOpenChange = useCallback(
    (open: boolean) => {
      setPreferences((current) => {
        if (current.advancedOpen === open) return current

        const next = { ...current, advancedOpen: open }
        persistCatalogOverviewPreferences(tableKey, next)
        return next
      })
    },
    [tableKey],
  )

  const filterChrome = filters ?? (
    <CatalogOverviewFilterChrome
      filterSchema={filterSchema}
      filterState={state}
      onFilterChange={setValue}
      onResetFilters={reset}
      advancedOpen={advancedOpen}
      onAdvancedOpenChange={handleAdvancedOpenChange}
    />
  )

  return (
    <CatalogOverviewTableBody
      tableKey={tableKey}
      columns={columns}
      visibleRows={visibleRows}
      toolbar={filterChrome}
      {...bodyProps}
    />
  )
}

function CatalogOverviewTableWithControlledFilters<
  T extends { id: string },
  TFilters extends Record<string, unknown>,
>({
  tableKey,
  columns,
  data,
  filterSchema,
  filterState,
  onFilterChange,
  onResetFilters,
  filters,
  ...bodyProps
}: CatalogOverviewTableCoreProps<T> & CatalogOverviewControlledFilterProps<T, TFilters>) {
  const columnSchema = useMemo(
    () => buildCatalogOverviewColumnSchema(columns as ColumnDef<unknown>[]),
    [columns],
  )
  const [preferences, setPreferences] = useState<CatalogOverviewPreferences>(() =>
    hydrateCatalogOverviewPreferences(tableKey, columnSchema),
  )
  const advancedOpen = preferences.advancedOpen ?? false

  const visibleRows = useMemo(
    () => applyFilterSchema(filterSchema, filterState, data),
    [data, filterSchema, filterState],
  )

  const handleAdvancedOpenChange = useCallback(
    (open: boolean) => {
      setPreferences((current) => {
        if (current.advancedOpen === open) return current

        const next = { ...current, advancedOpen: open }
        persistCatalogOverviewPreferences(tableKey, next)
        return next
      })
    },
    [tableKey],
  )

  const filterChrome = filters ?? (
    <CatalogOverviewFilterChrome
      filterSchema={filterSchema}
      filterState={filterState}
      onFilterChange={onFilterChange}
      onResetFilters={onResetFilters}
      advancedOpen={advancedOpen}
      onAdvancedOpenChange={handleAdvancedOpenChange}
    />
  )

  return (
    <CatalogOverviewTableBody
      tableKey={tableKey}
      columns={columns}
      visibleRows={visibleRows}
      toolbar={filterChrome}
      {...bodyProps}
    />
  )
}

/** Shared catalog overview shell — utility strip, column prefs, optional filters. */
export function CatalogOverviewTable<
  T extends { id: string },
  TFilters extends Record<string, unknown> = Record<string, never>,
>(props: CatalogOverviewTableProps<T, TFilters>) {
  const {
    tableKey,
    columns,
    data,
    filterSchema,
    filterState,
    onFilterChange,
    onResetFilters,
    filters,
    ...bodyProps
  } = props

  if (filterSchema) {
    if (filterState !== undefined && onFilterChange && onResetFilters) {
      return (
        <CatalogOverviewTableWithControlledFilters
          tableKey={tableKey}
          columns={columns}
          data={data}
          filterSchema={filterSchema}
          filterState={filterState}
          onFilterChange={onFilterChange}
          onResetFilters={onResetFilters}
          filters={filters}
          {...bodyProps}
        />
      )
    }

    return (
      <CatalogOverviewTableWithInternalFilters
        tableKey={tableKey}
        columns={columns}
        data={data}
        filterSchema={filterSchema}
        filters={filters}
        {...bodyProps}
      />
    )
  }

  return (
    <CatalogOverviewTableBody
      tableKey={tableKey}
      columns={columns}
      visibleRows={data}
      toolbar={filters}
      {...bodyProps}
    />
  )
}
