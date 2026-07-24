'use client'

import { memo, useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  type CampaignAvailabilityFilter,
  type ContentTypeKey,
  type WithCampaignAccess,
} from '@rpg/contracts'
import {
  Button,
  DataTable,
  areColumnChangeStatesEqual,
  dataTableFilterNoticeVariants,
  dataTableRowUnavailableRailVariants,
  dataTableRowUnavailableVariants,
  type ColumnDef,
  type ColumnChangeState,
} from '@rpg/ui'
import {
  FilterAdvancedPanel,
  FilterBar,
  FilterChromeProvider,
  applyFilterSchema,
  getEffectiveFilterValue,
  getSchemaFieldsByPlacement,
  type FilterFieldId,
  type FilterSchema,
} from '@rpg/ui/filters'

import { getContentTypeMidSentenceLabel } from '../content-type-labels'
import { useCanManageCampaign } from '@/features/campaign'
import {
  CAMPAIGN_ACCESS_TABLE_HIDE_UNAVAILABLE_LABEL,
  CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL,
  CAMPAIGN_ACCESS_TABLE_SHOW_UNAVAILABLE_LABEL,
  formatHiddenUnavailableNotice,
  formatHideUnavailableAriaLabel,
  formatNoAvailableMatchesLabel,
  formatShowAllCampaignAvailabilityAriaLabel,
  formatShowUnavailableAriaLabel,
  formatUnavailableItemsShownNotice,
  formatUnavailableMatchesLine,
} from '../campaign-access/campaign-access-table-labels'
import {
  buildContentOverviewColumnSchema,
  getContentOverviewSortableColumnIds,
} from './content-overview-columns.lib'
import { useOverviewColumnsWithNameContext } from './content-overview-columns.client'
import { filterCatalogRowsForViewer } from './filter-catalog-rows-for-viewer'
import { useContentViewer } from './use-content-viewer'
import {
  CONTENT_OVERVIEW_PREFERENCES_DEFAULTS,
  hydrateContentOverviewPreferences,
  persistContentOverviewPreferences,
  type ContentOverviewPageSize,
  type ContentOverviewPreferences,
} from './content-overview-preferences'
import { ContentOverviewRowActions } from './content-overview-row-actions'
import {
  CAMPAIGN_AVAILABILITY_FILTER_ID,
  deriveCampaignAvailabilityScope,
} from './content-availability-table.lib'
import type { ContentBase } from './content-table-config'
import type { ContentOverviewBaseFilterState } from './content-overview-filter-schema'
import { useContentOverviewQueryState } from './use-content-overview-query-state.client'

const EDIT_DETAILS_LABEL = 'Edit details'
const DEFAULT_OVERVIEW_SORT = { id: 'name' } as const
const OVERVIEW_NAME_COLUMN_ID = 'name'

type ContentOverviewDataTableProps<T extends WithCampaignAccess<ContentBase> & { id: string }> = {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  pageSize: ContentOverviewPageSize
  columnVisibility?: ContentOverviewPreferences['columnVisibility']
  columnOrder?: ContentOverviewPreferences['columnOrder']
  canManage: boolean
  campaignId: string
  contentTypeKey: ContentTypeKey
  itemLabel: string
  campaignAvailability: CampaignAvailabilityFilter
  getEditHref: (row: T) => string
  onColumnChange: (state: ColumnChangeState) => void
  caption?: string
  emptyState: ReactNode | ((context: { filteredRowCount: number }) => ReactNode)
  restoreFocusRef: React.MutableRefObject<(removedRowId: string) => void>
  registerActionTrigger: (rowId: string, element: HTMLButtonElement | null) => void
}

const ContentOverviewDataTable = memo(function ContentOverviewDataTable<
  T extends WithCampaignAccess<ContentBase> & { id: string },
>({
  columns,
  data,
  pageSize,
  columnVisibility,
  columnOrder,
  canManage,
  campaignId,
  contentTypeKey,
  itemLabel,
  campaignAvailability,
  getEditHref,
  onColumnChange,
  caption,
  emptyState,
  restoreFocusRef,
  registerActionTrigger,
}: ContentOverviewDataTableProps<T>) {
  const getEditHrefRef = useRef(getEditHref)
  getEditHrefRef.current = getEditHref

  const rowActions = useCallback(
    (row: T) => (
      <ContentOverviewRowActions
        campaignId={campaignId}
        contentTypeKey={contentTypeKey}
        entityId={row.id}
        editHref={getEditHrefRef.current(row)}
        itemLabel={itemLabel}
        campaignAccess={row.campaignAccess}
        campaignAvailabilityFilter={campaignAvailability}
        canManage={canManage}
        editLabel={EDIT_DETAILS_LABEL}
        onRowRemoved={() => restoreFocusRef.current(row.id)}
        triggerRef={(element) => registerActionTrigger(row.id, element)}
      />
    ),
    [campaignAvailability, campaignId, canManage, contentTypeKey, itemLabel, registerActionTrigger],
  )

  const getRowClassName = useCallback(
    (row: { original: T }) =>
      row.original.campaignAccess.available ? undefined : dataTableRowUnavailableVariants(),
    [],
  )

  const getCellClassName = useCallback((cell: { column: { id: string }; row: { original: T } }) => {
    if (cell.row.original.campaignAccess.available) return undefined
    if (cell.column.id !== OVERVIEW_NAME_COLUMN_ID) return undefined
    return dataTableRowUnavailableRailVariants()
  }, [])

  const resolvedEmptyState = useMemo(
    () =>
      typeof emptyState === 'function'
        ? (context: { filteredRowCount: number; totalRowCount: number }) =>
            emptyState({ filteredRowCount: context.filteredRowCount })
        : () => emptyState,
    [emptyState],
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      defaultPageSize={pageSize}
      initialColumnVisibility={columnVisibility}
      initialColumnOrder={columnOrder}
      onColumnChange={onColumnChange}
      rowActions={canManage ? rowActions : undefined}
      caption={caption}
      emptyState={resolvedEmptyState}
      getRowClassName={getRowClassName}
      getCellClassName={getCellClassName}
    />
  )
}) as <T extends WithCampaignAccess<ContentBase> & { id: string }>(
  props: ContentOverviewDataTableProps<T>,
) => React.JSX.Element

export type ContentOverviewTableProps<
  T extends WithCampaignAccess<ContentBase> & { id: string },
  TFilters extends ContentOverviewBaseFilterState = ContentOverviewBaseFilterState,
> = {
  contentTypeKey: ContentTypeKey
  campaignId: string
  columns: ColumnDef<T, unknown>[]
  filterSchema: FilterSchema<T, TFilters>
  data: T[]
  caption?: string
  getEditHref: (row: T) => string
}

export function ContentOverviewTable<
  T extends WithCampaignAccess<ContentBase> & { id: string },
  TFilters extends ContentOverviewBaseFilterState = ContentOverviewBaseFilterState,
>({
  contentTypeKey,
  campaignId,
  columns,
  filterSchema,
  data,
  caption,
  getEditHref,
}: ContentOverviewTableProps<T, TFilters>) {
  const tableRootRef = useRef<HTMLDivElement>(null)
  const actionTriggerRefs = useRef(new Map<string, HTMLButtonElement>())
  const canManage = useCanManageCampaign(campaignId)
  const viewer = useContentViewer(campaignId)
  const getEditHrefRef = useRef(getEditHref)
  getEditHrefRef.current = getEditHref

  const discoveryFilteredData = useMemo(
    () => filterCatalogRowsForViewer(data, viewer),
    [data, viewer],
  )

  const overviewColumns = useOverviewColumnsWithNameContext(columns, {
    canManage,
    campaignId,
    contentTypeKey,
    viewer,
    getEditHref: (row) => getEditHrefRef.current(row),
  })
  const columnSchema = useMemo(
    () => buildContentOverviewColumnSchema(overviewColumns as ColumnDef<unknown>[]),
    [overviewColumns],
  )
  const [preferences, setPreferences] = useState<ContentOverviewPreferences>(() =>
    hydrateContentOverviewPreferences(contentTypeKey, columnSchema),
  )
  const advancedOpen = preferences.advancedOpen ?? false
  const allowedSortIds = useMemo(
    () => getContentOverviewSortableColumnIds(overviewColumns as ColumnDef<unknown>[]),
    [overviewColumns],
  )
  const hasAdvancedFields = useMemo(
    () => getSchemaFieldsByPlacement(filterSchema, 'advanced').length > 0,
    [filterSchema],
  )
  const { query, actions } = useContentOverviewQueryState<T, TFilters>({
    schema: filterSchema,
    allowedSortIds,
    defaultSort: DEFAULT_OVERVIEW_SORT,
  })

  const campaignAvailabilityFilterId = CAMPAIGN_AVAILABILITY_FILTER_ID as FilterFieldId<TFilters>

  const filterState = query.filters
  const campaignAvailability =
    (getEffectiveFilterValue(filterSchema, filterState, campaignAvailabilityFilterId) as
      | CampaignAvailabilityFilter
      | undefined) ?? CAMPAIGN_AVAILABILITY_FILTER_DEFAULT

  const scopedRows = useMemo(
    () =>
      applyFilterSchema(filterSchema, filterState, discoveryFilteredData, {
        excludeFieldIds: [campaignAvailabilityFilterId],
      }),
    [campaignAvailabilityFilterId, discoveryFilteredData, filterSchema, filterState],
  )

  const scope = useMemo(
    () => deriveCampaignAvailabilityScope(scopedRows, { campaignAvailability }),
    [campaignAvailability, scopedRows],
  )

  const visibleRows = useMemo(
    () => applyFilterSchema(filterSchema, filterState, discoveryFilteredData),
    [discoveryFilteredData, filterSchema, filterState],
  )

  const pluralNoun = getContentTypeMidSentenceLabel(contentTypeKey, { plural: true })
  const itemLabel = getContentTypeMidSentenceLabel(contentTypeKey)

  const handleAdvancedOpenChange = useCallback(
    (open: boolean) => {
      setPreferences((current) => {
        if (current.advancedOpen === open) return current

        const next = { ...current, advancedOpen: open }
        persistContentOverviewPreferences(contentTypeKey, next)
        return next
      })
    },
    [contentTypeKey],
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

        persistContentOverviewPreferences(contentTypeKey, next)
        return next
      })
    },
    [contentTypeKey],
  )

  const handleFilterValueChange = useCallback(
    (id: FilterFieldId<TFilters>, value: unknown) => {
      actions.setFilterValue(id, value as TFilters[typeof id])
    },
    [actions],
  )

  const restoreFocusAfterRowRemoved = useCallback(
    (removedRowId: string) => {
      const orderedIds = visibleRows.map((row) => row.id)
      const removedIndex = orderedIds.indexOf(removedRowId)
      const candidateIds = [
        ...orderedIds.slice(removedIndex + 1),
        ...orderedIds.slice(0, removedIndex).reverse(),
      ]

      for (const candidateId of candidateIds) {
        const trigger = actionTriggerRefs.current.get(candidateId)
        if (trigger) {
          trigger.focus()
          return
        }
      }

      tableRootRef.current?.focus()
    },
    [visibleRows],
  )

  const restoreFocusRef = useRef(restoreFocusAfterRowRemoved)
  restoreFocusRef.current = restoreFocusAfterRowRemoved

  const registerActionTrigger = useCallback((rowId: string, element: HTMLButtonElement | null) => {
    if (element) {
      actionTriggerRefs.current.set(rowId, element)
      return
    }

    actionTriggerRefs.current.delete(rowId)
  }, [])

  const tablePageSize: ContentOverviewPageSize =
    preferences.pageSize ?? CONTENT_OVERVIEW_PREFERENCES_DEFAULTS.pageSize ?? 20

  const filterNotice = useMemo(() => {
    if (scope.unavailableCount === 0) return null

    if (campaignAvailability === 'available') {
      return (
        <>
          <span>{formatHiddenUnavailableNotice(scope.unavailableCount)}</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-0 text-xs"
            aria-label={formatShowAllCampaignAvailabilityAriaLabel()}
            onClick={() =>
              actions.setFilterValue(
                campaignAvailabilityFilterId,
                'all' as TFilters[FilterFieldId<TFilters>],
                { history: 'push' },
              )
            }
          >
            {CAMPAIGN_ACCESS_TABLE_SHOW_ALL_LABEL}
          </Button>
        </>
      )
    }

    if (campaignAvailability === 'all') {
      return (
        <>
          <span>{formatUnavailableItemsShownNotice()}</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-0 text-xs"
            aria-label={formatHideUnavailableAriaLabel()}
            onClick={() =>
              actions.setFilterValue(
                campaignAvailabilityFilterId,
                'available' as TFilters[FilterFieldId<TFilters>],
                { history: 'push' },
              )
            }
          >
            {CAMPAIGN_ACCESS_TABLE_HIDE_UNAVAILABLE_LABEL}
          </Button>
        </>
      )
    }

    return null
  }, [actions, campaignAvailability, scope.unavailableCount])

  const emptyState = useCallback(() => {
    if (
      campaignAvailability === 'available' &&
      scope.unavailableCount > 0 &&
      scope.visibleCount === 0
    ) {
      return (
        <div className="space-y-1 text-center">
          <p>{formatNoAvailableMatchesLabel(pluralNoun)}</p>
          <p className="text-muted-foreground">
            {formatUnavailableMatchesLine(scope.unavailableCount, pluralNoun)}{' '}
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto px-0 text-xs"
              aria-label={formatShowUnavailableAriaLabel(pluralNoun)}
              onClick={() =>
                actions.setFilterValue(
                  campaignAvailabilityFilterId,
                  'unavailable' as TFilters[FilterFieldId<TFilters>],
                  { history: 'push' },
                )
              }
            >
              {CAMPAIGN_ACCESS_TABLE_SHOW_UNAVAILABLE_LABEL}
            </Button>
          </p>
        </div>
      )
    }

    return <p>No results.</p>
  }, [actions, campaignAvailability, pluralNoun, scope.unavailableCount, scope.visibleCount])

  return (
    <div ref={tableRootRef} tabIndex={-1} className="flex flex-col gap-3 outline-none">
      <FilterChromeProvider>
        <FilterBar
          schema={filterSchema}
          state={filterState}
          onValueChange={handleFilterValueChange}
          onReset={() => actions.resetFilters()}
          advancedOpen={advancedOpen}
          onAdvancedOpenChange={hasAdvancedFields ? handleAdvancedOpenChange : undefined}
        />

        <FilterAdvancedPanel
          schema={filterSchema}
          state={filterState}
          onValueChange={handleFilterValueChange}
          open={advancedOpen}
          onClearAll={() => actions.resetFilters()}
        />
      </FilterChromeProvider>

      {filterNotice ? <div className={dataTableFilterNoticeVariants()}>{filterNotice}</div> : null}

      <ContentOverviewDataTable
        columns={overviewColumns}
        data={visibleRows}
        pageSize={tablePageSize}
        columnVisibility={preferences.columnVisibility}
        columnOrder={preferences.columnOrder}
        canManage={canManage}
        campaignId={campaignId}
        contentTypeKey={contentTypeKey}
        itemLabel={itemLabel}
        campaignAvailability={campaignAvailability}
        getEditHref={getEditHref}
        onColumnChange={handleColumnChange}
        caption={caption}
        emptyState={emptyState}
        restoreFocusRef={restoreFocusRef}
        registerActionTrigger={registerActionTrigger}
      />
    </div>
  )
}
