'use client'

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { CampaignAvailabilityFilter } from '@rpg/contracts'
import {
  DataTableFilterRegion,
  type ColumnDef,
  type DataTableEmptyStateContext,
  type DataTableProps,
  type DataTableUtilityControls,
} from '@rpg/ui'
import {
  applyFilterSchema,
  countModifiedFilters,
  createInitialFilterState,
  FilterBar,
  FilterChromeProvider,
  FilterFieldList,
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
import {
  applyOverviewAdvancedOpenPreferences,
  applyOverviewColumnChangePreferences,
} from '@/lib/overview-preferences'
import type { CampaignAvailabilityScope } from '@/lib/overview/campaign-availability-scope.lib'
import { useCatalogOverviewAvailability } from '@/lib/overview/use-catalog-overview-availability.client'
import {
  buildCatalogOverviewSelectionFrameProps,
  type CatalogOverviewSelectionConfig,
} from './catalog-overview-selection.client'
import { OverviewResultSummary } from './overview-result-summary.client'
import { OverviewTableFrame } from './overview-table-frame.client'

export type { CatalogOverviewSelectionConfig } from './catalog-overview-selection.client'

export type CatalogOverviewAvailabilityEmptyStateContext<TFilters extends Record<string, unknown>> =
  {
    scope: CampaignAvailabilityScope
    campaignAvailability: CampaignAvailabilityFilter
    setFilterValue: (
      id: FilterFieldId<TFilters>,
      value: TFilters[FilterFieldId<TFilters>] | undefined,
      options?: { history?: 'push' },
    ) => void
  }

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
  selection?: CatalogOverviewSelectionConfig<T>
  resultSupplement?: ReactNode
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

export type CatalogOverviewAvailabilityEmptyStateProps<TFilters extends Record<string, unknown>> = {
  availabilityEmptyState?: (
    context: CatalogOverviewAvailabilityEmptyStateContext<TFilters>,
  ) => ReactNode
}

export type CatalogOverviewTableProps<
  T extends { id: string },
  TFilters extends Record<string, unknown> = Record<string, never>,
> = CatalogOverviewTableCoreProps<T> &
  CatalogOverviewAvailabilityEmptyStateProps<TFilters> &
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
  availabilityEmptyState?: ReactNode
  caption?: string
  rowActions?: (row: T) => ReactNode
  getRowClassName?: DataTableProps<T>['getRowClassName']
  getCellClassName?: DataTableProps<T>['getCellClassName']
  filterRegion?: ReactNode
  selection?: CatalogOverviewSelectionConfig<T>
  resultSupplement?: ReactNode
}

const COLUMNS_ARIA_LABEL = 'Choose visible columns'

function CatalogOverviewTableBody<T extends { id: string }>({
  tableKey,
  columns,
  visibleRows,
  resultCountLabel,
  emptyState,
  availabilityEmptyState,
  caption,
  rowActions,
  getRowClassName,
  getCellClassName,
  filterRegion,
  selection,
  resultSupplement,
}: CatalogOverviewTableBodyProps<T>) {
  const columnSchema = useMemo(
    () => buildCatalogOverviewColumnSchema(columns as ColumnDef<unknown>[]),
    [columns],
  )
  const [preferences, setPreferences] = useState<CatalogOverviewPreferences>(() =>
    hydrateCatalogOverviewPreferences(tableKey, columnSchema),
  )

  const handleColumnChange = useCallback(
    (state: Parameters<typeof applyOverviewColumnChangePreferences>[1]) => {
      setPreferences((current) => {
        const { next, changed } = applyOverviewColumnChangePreferences(current, state)
        if (!changed) return current

        persistCatalogOverviewPreferences(tableKey, next)
        return next
      })
    },
    [tableKey],
  )

  const resolvedResultCountLabel = resultCountLabel ?? formatCatalogResultCount(visibleRows.length)

  const tablePageSize: CatalogOverviewPageSize =
    preferences.pageSize ?? CATALOG_OVERVIEW_PREFERENCES_DEFAULTS.pageSize ?? 20

  const selectionFrame = buildCatalogOverviewSelectionFrameProps(selection)

  const resolvedEmptyState = useMemo(() => {
    if (availabilityEmptyState && visibleRows.length === 0) {
      return availabilityEmptyState
    }
    return emptyState
  }, [availabilityEmptyState, emptyState, visibleRows.length])

  const renderUtilityActions = useCallback(
    (controls: DataTableUtilityControls<T>) => (
      <controls.ColumnVisibilityTrigger aria-label={COLUMNS_ARIA_LABEL} showLabel />
    ),
    [],
  )

  return (
    <OverviewTableFrame
      columns={columns}
      data={visibleRows}
      caption={caption}
      emptyState={resolvedEmptyState}
      rowActions={rowActions}
      getRowClassName={getRowClassName}
      getCellClassName={getCellClassName}
      defaultPageSize={tablePageSize}
      initialColumnVisibility={preferences.columnVisibility}
      initialColumnOrder={preferences.columnOrder}
      onColumnChange={handleColumnChange}
      filterRegion={filterRegion}
      resultSummary={
        <OverviewResultSummary
          resultCount={visibleRows.length}
          resultLabel={resolvedResultCountLabel}
          supplementalContent={resultSupplement}
        />
      }
      leadingActions={selectionFrame.renderLeadingActions}
      trailingActions={renderUtilityActions}
      selectionModeActive={selectionFrame.selectionModeActive}
      enableRowSelection={selectionFrame.enableRowSelection}
      rowSelection={selectionFrame.rowSelection}
      onRowSelectionChange={selectionFrame.onRowSelectionChange}
      onRowSelectionStateChange={selectionFrame.onRowSelectionStateChange}
      selectionLabels={selectionFrame.selectionLabels}
      getRowCanSelect={selectionFrame.getRowCanSelect}
      rowSelectionDescribedBy={selectionFrame.rowSelectionDescribedBy}
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

export function CatalogOverviewFilterChrome<T, TFilters extends Record<string, unknown>>({
  filterSchema,
  filterState,
  onFilterChange,
  onResetFilters,
  advancedOpen,
  onAdvancedOpenChange,
}: CatalogOverviewFilterChromeProps<T, TFilters>) {
  const advancedFields = useMemo(
    () => getSchemaFieldsByPlacement(filterSchema, 'advanced'),
    [filterSchema],
  )
  const advancedModifiedCount = countModifiedFilters(filterSchema, filterState, 'advanced')

  const handleResetAdvancedFilters = useCallback(() => {
    const defaults = createInitialFilterState(filterSchema)
    for (const field of advancedFields) {
      onFilterChange(field.id, defaults[field.id])
    }
  }, [advancedFields, filterSchema, onFilterChange])

  return (
    <FilterChromeProvider>
      <DataTableFilterRegion
        primaryFilters={
          <FilterBar
            schema={filterSchema}
            state={filterState}
            onValueChange={onFilterChange}
            onReset={onResetFilters}
          />
        }
        additionalFilterFields={
          advancedFields.length > 0 ? (
            <FilterFieldList
              schema={filterSchema}
              fields={advancedFields}
              state={filterState}
              idPrefix="filters-advanced"
              onValueChange={onFilterChange}
            />
          ) : undefined
        }
        additionalFiltersOpen={advancedOpen}
        onAdditionalFiltersOpenChange={onAdvancedOpenChange}
        activeAdditionalFilterCount={advancedModifiedCount}
        onResetAdditionalFilters={handleResetAdvancedFilters}
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
  selection,
  availabilityEmptyState: availabilityEmptyStateProp,
  ...bodyProps
}: CatalogOverviewTableCoreProps<T> &
  CatalogOverviewInternalFilterProps<T, TFilters> & {
    filterSchema: FilterSchema<T, TFilters>
    availabilityEmptyState?: (
      context: CatalogOverviewAvailabilityEmptyStateContext<TFilters>,
    ) => ReactNode
  }) {
  const columnSchema = useMemo(
    () => buildCatalogOverviewColumnSchema(columns as ColumnDef<unknown>[]),
    [columns],
  )
  const [preferences, setPreferences] = useState<CatalogOverviewPreferences>(() =>
    hydrateCatalogOverviewPreferences(tableKey, columnSchema),
  )
  const advancedOpen = preferences.advancedOpen ?? false
  const { state, setValue, reset } = useFilterState(filterSchema, { data })

  const availability = useCatalogOverviewAvailability({
    filterSchema,
    data,
    filterState: state,
    onFilterChange: setValue,
  })

  const availabilityEmptyState = useMemo(() => {
    if (
      !availabilityEmptyStateProp ||
      !availability.shouldUseAvailabilityEmptyState ||
      !availability.scope
    ) {
      return undefined
    }

    return availabilityEmptyStateProp({
      scope: availability.scope,
      campaignAvailability: availability.campaignAvailability,
      setFilterValue: setValue,
    })
  }, [
    availability.campaignAvailability,
    availability.scope,
    availability.shouldUseAvailabilityEmptyState,
    availabilityEmptyStateProp,
    setValue,
  ])

  const visibleRows = useMemo(
    () => applyFilterSchema(filterSchema, state, data),
    [data, filterSchema, state],
  )

  const handleAdvancedOpenChange = useCallback(
    (open: boolean) => {
      setPreferences((current) => {
        const { next, changed } = applyOverviewAdvancedOpenPreferences(current, open)
        if (!changed) return current

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
      filterRegion={filterChrome}
      selection={selection}
      availabilityEmptyState={availabilityEmptyState}
      resultSupplement={availability.resultSupplement ?? undefined}
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
  selection,
  availabilityEmptyState: availabilityEmptyStateProp,
  ...bodyProps
}: CatalogOverviewTableCoreProps<T> &
  CatalogOverviewControlledFilterProps<T, TFilters> & {
    availabilityEmptyState?: (
      context: CatalogOverviewAvailabilityEmptyStateContext<TFilters>,
    ) => ReactNode
  }) {
  const columnSchema = useMemo(
    () => buildCatalogOverviewColumnSchema(columns as ColumnDef<unknown>[]),
    [columns],
  )
  const [preferences, setPreferences] = useState<CatalogOverviewPreferences>(() =>
    hydrateCatalogOverviewPreferences(tableKey, columnSchema),
  )
  const advancedOpen = preferences.advancedOpen ?? false

  const availability = useCatalogOverviewAvailability({
    filterSchema,
    data,
    filterState,
    onFilterChange,
  })

  const availabilityEmptyState = useMemo(() => {
    if (
      !availabilityEmptyStateProp ||
      !availability.shouldUseAvailabilityEmptyState ||
      !availability.scope
    ) {
      return undefined
    }

    return availabilityEmptyStateProp({
      scope: availability.scope,
      campaignAvailability: availability.campaignAvailability,
      setFilterValue: onFilterChange,
    })
  }, [
    availability.campaignAvailability,
    availability.scope,
    availability.shouldUseAvailabilityEmptyState,
    availabilityEmptyStateProp,
    onFilterChange,
  ])

  const visibleRows = useMemo(
    () => applyFilterSchema(filterSchema, filterState, data),
    [data, filterSchema, filterState],
  )

  const handleAdvancedOpenChange = useCallback(
    (open: boolean) => {
      setPreferences((current) => {
        const { next, changed } = applyOverviewAdvancedOpenPreferences(current, open)
        if (!changed) return current

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
      filterRegion={filterChrome}
      selection={selection}
      availabilityEmptyState={availabilityEmptyState}
      resultSupplement={availability.resultSupplement ?? undefined}
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
    selection,
    availabilityEmptyState,
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
          selection={selection}
          availabilityEmptyState={availabilityEmptyState}
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
        selection={selection}
        availabilityEmptyState={availabilityEmptyState}
        {...bodyProps}
      />
    )
  }

  return (
    <CatalogOverviewTableBody
      tableKey={tableKey}
      columns={columns}
      visibleRows={data}
      filterRegion={filters}
      selection={selection}
      {...bodyProps}
    />
  )
}
