'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  partitionApplyOutcomes,
  supportsContentBulkCampaignAccess,
  type ActionApplyOutcome,
  type ActionTargetFailure,
  type CampaignAvailabilityFilter,
  type ContentTypeKey,
  type WithCampaignAccess,
} from '@rpg/contracts'
import { type ColumnDef, type ColumnChangeState, type DataTableUtilityControls } from '@rpg/ui'
import {
  applyFilterSchema,
  getEffectiveFilterValue,
  getSchemaFieldsByPlacement,
  type FilterFieldId,
  type FilterSchema,
} from '@rpg/ui/filters'

import { getContentTypeMidSentenceLabel } from '../content-type-labels'
import { useCanManageCampaign } from '@/features/campaign'
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
import { BulkCampaignAccessDialog } from '../campaign-access/bulk/bulk-campaign-access-dialog.client'
import {
  buildContentOverviewEmptyState,
  buildContentOverviewHiddenSupplement,
} from './content-overview-availability-ui.lib'
import { useContentOverviewBulkSelection } from './use-content-overview-bulk-selection'
import {
  CAMPAIGN_AVAILABILITY_FILTER_ID,
  deriveCampaignAvailabilityScope,
} from './content-availability-table.lib'
import type { ContentBase } from './content-table-config'
import type { ContentOverviewBaseFilterState } from './content-overview-filter-schema'
import { useContentOverviewQueryState } from './use-content-overview-query-state.client'
import { ContentBulkActionsMenu } from './content-bulk-actions-menu.client'
import type { OverviewBulkAction } from '@/lib/overview/overview-bulk-actions-menu.client'
import { CatalogOverviewFilterChrome } from '@/lib/data-table/catalog-overview-table.client'
import {
  overviewUnavailableNameCellClassName,
  overviewUnavailableRowClassName,
} from '@/lib/overview/overview-unavailable-chrome'
import { OverviewResultSummary } from '@/lib/data-table/overview-result-summary.client'
import { OverviewSelectionCluster } from '@/lib/data-table/overview-selection-cluster.client'
import { OverviewTableFrame } from '@/lib/data-table/overview-table-frame.client'
import {
  applyOverviewAdvancedOpenPreferences,
  applyOverviewColumnChangePreferences,
} from '@/lib/overview-preferences'

const DEFAULT_OVERVIEW_SORT = { id: 'name' } as const
const EMPTY_BULK_EXTENSIONS: ContentOverviewBulkExtension<
  WithCampaignAccess<ContentBase> & { id: string }
>[] = []
const OVERVIEW_NAME_COLUMN_ID = 'name'
const COLUMNS_ARIA_LABEL = 'Choose visible columns'

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
  resultSupplement?: ReactNode
  selectionMode: boolean
  rowSelection: Record<string, boolean>
  selectionLimit: number
  selectionLiveRegionId: string
  selectionLiveRegionMessage: string
  selectionCapDescriptionId: string
  onEnterSelectionMode: () => void
  onExitSelectionMode: () => void
  onRowSelectionChange: (rows: T[]) => void
  onRowSelectionStateChange: (state: Record<string, boolean>) => void
  getRowCanSelect: (row: T) => boolean
  onEditCampaignAccess?: () => void
  additionalBulkActions?: readonly OverviewBulkAction[]
  getEditHref: (row: T) => string
  onColumnChange: (state: ColumnChangeState) => void
  caption?: string
  emptyState: ReactNode | ((context: { filteredRowCount: number }) => ReactNode)
  restoreFocusRef: React.MutableRefObject<(removedRowId: string) => void>
  registerActionTrigger: (rowId: string, element: HTMLButtonElement | null) => void
  selectTriggerRef: React.RefObject<HTMLButtonElement | null>
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
  resultSupplement,
  selectionMode,
  rowSelection,
  selectionLimit,
  selectionLiveRegionId,
  selectionLiveRegionMessage,
  selectionCapDescriptionId,
  onEnterSelectionMode,
  onExitSelectionMode,
  onRowSelectionChange,
  onRowSelectionStateChange,
  getRowCanSelect,
  onEditCampaignAccess,
  additionalBulkActions = [],
  getEditHref: _getEditHref,
  onColumnChange,
  caption,
  emptyState,
  restoreFocusRef,
  registerActionTrigger,
  selectTriggerRef,
}: ContentOverviewDataTableProps<T>) {
  const rowActions = useCallback(
    (row: T) => (
      <ContentOverviewRowActions
        campaignId={campaignId}
        contentTypeKey={contentTypeKey}
        entityId={row.id}
        entityName={row.name}
        itemLabel={itemLabel}
        campaignAccess={row.campaignAccess}
        campaignAvailabilityFilter={campaignAvailability}
        canManage={canManage}
        onRowRemoved={() => restoreFocusRef.current(row.id)}
        triggerRef={(element) => registerActionTrigger(row.id, element)}
      />
    ),
    [
      campaignAvailability,
      campaignId,
      canManage,
      contentTypeKey,
      itemLabel,
      registerActionTrigger,
      restoreFocusRef,
    ],
  )

  const getRowClassName = useCallback(
    (row: { original: T }) =>
      overviewUnavailableRowClassName(row.original.campaignAccess.available),
    [],
  )

  const getCellClassName = useCallback((cell: { column: { id: string }; row: { original: T } }) => {
    return overviewUnavailableNameCellClassName(
      cell.row.original.campaignAccess.available,
      cell.column.id,
      OVERVIEW_NAME_COLUMN_ID,
    )
  }, [])

  const resolvedEmptyState = useMemo(
    () =>
      typeof emptyState === 'function'
        ? (context: { filteredRowCount: number; totalRowCount: number }) =>
            emptyState({ filteredRowCount: context.filteredRowCount })
        : () => emptyState,
    [emptyState],
  )

  const renderLeadingActions = useCallback(
    (controls: DataTableUtilityControls<T>) =>
      canManage ? (
        <OverviewSelectionCluster
          mode={selectionMode ? 'selection' : 'browse'}
          selectedCount={controls.selectedRowCount}
          selectionLiveRegionId={selectionLiveRegionId}
          selectionLiveRegionMessage={selectionLiveRegionMessage}
          selectionCapDescriptionId={selectionCapDescriptionId}
          selectionLimit={selectionLimit}
          pageSelectableCount={controls.pageSelectableRowCount}
          isAllPageRowsSelected={controls.isAllPageRowsSelected}
          onToggleAllPageRowsSelected={controls.toggleAllPageRowsSelected}
          onEnterSelectionMode={onEnterSelectionMode}
          onExitSelectionMode={onExitSelectionMode}
          bulkActionsMenu={
            controls.selectedRowCount > 0 &&
            (onEditCampaignAccess || additionalBulkActions.length > 0) ? (
              <ContentBulkActionsMenu
                onEditCampaignAccess={onEditCampaignAccess}
                additionalActions={additionalBulkActions}
              />
            ) : undefined
          }
          selectTriggerRef={selectTriggerRef}
        />
      ) : null,
    [
      canManage,
      onEditCampaignAccess,
      additionalBulkActions,
      onEnterSelectionMode,
      onExitSelectionMode,
      selectTriggerRef,
      selectionCapDescriptionId,
      selectionLimit,
      selectionLiveRegionId,
      selectionLiveRegionMessage,
      selectionMode,
    ],
  )

  const renderTrailingActions = useCallback(
    (controls: DataTableUtilityControls<T>) => (
      <controls.ColumnVisibilityTrigger aria-label={COLUMNS_ARIA_LABEL} showLabel />
    ),
    [],
  )

  const selectionLabels = useMemo(
    () =>
      selectionMode
        ? {
            selectAll: (pageRowCount: number) => `Select all ${pageRowCount} rows on this page`,
            selectRow: (row: T) => `Select ${row.name}`,
          }
        : undefined,
    [selectionMode],
  )

  return (
    <OverviewTableFrame
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
      resultSummary={
        <OverviewResultSummary resultCount={data.length} supplementalContent={resultSupplement} />
      }
      leadingActions={canManage ? renderLeadingActions : undefined}
      trailingActions={renderTrailingActions}
      selectionModeActive={selectionMode && canManage}
      enableRowSelection={selectionMode && canManage}
      rowSelection={rowSelection}
      onRowSelectionChange={onRowSelectionChange}
      onRowSelectionStateChange={onRowSelectionStateChange}
      selectionLabels={selectionLabels}
      getRowCanSelect={getRowCanSelect}
      rowSelectionDescribedBy={selectionCapDescriptionId}
    />
  )
}) as <T extends WithCampaignAccess<ContentBase> & { id: string }>(
  props: ContentOverviewDataTableProps<T>,
) => React.JSX.Element

export type ContentOverviewBulkExtensionRenderContext<
  T extends WithCampaignAccess<ContentBase> & { id: string },
> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  selectedRows: T[]
  campaignRows: T[]
  onApplyComplete: (outcomes: ActionApplyOutcome<unknown, ActionTargetFailure>[]) => void
}

export type ContentOverviewBulkExtension<
  T extends WithCampaignAccess<ContentBase> & { id: string },
> = {
  menuAction: OverviewBulkAction
  renderDialog: (context: ContentOverviewBulkExtensionRenderContext<T>) => ReactNode
}

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
  bulkExtensions?: ContentOverviewBulkExtension<T>[]
}

// fallow-ignore-next-line complexity
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
  bulkExtensions = EMPTY_BULK_EXTENSIONS,
}: ContentOverviewTableProps<T, TFilters>) {
  const tableRootRef = useRef<HTMLDivElement>(null)
  const selectTriggerRef = useRef<HTMLButtonElement>(null)
  const actionTriggerRefs = useRef(new Map<string, HTMLButtonElement>())
  const canManage = useCanManageCampaign(campaignId)
  const viewer = useContentViewer(campaignId)

  const overviewColumns = useOverviewColumnsWithNameContext(columns, {
    canManage,
    campaignId,
    contentTypeKey,
    viewer,
    getEditHref,
  })

  const discoveryFilteredData = useMemo(
    () => filterCatalogRowsForViewer(data, viewer),
    [data, viewer],
  )

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
  const advancedFields = useMemo(
    () => getSchemaFieldsByPlacement(filterSchema, 'advanced'),
    [filterSchema],
  )
  const hasAdvancedFields = advancedFields.length > 0
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

  const visibleRowIds = useMemo(() => new Set(visibleRows.map((row) => row.id)), [visibleRows])
  const {
    selectionMode,
    rowSelection,
    selectedRows,
    selectedCount,
    selectionLimit,
    selectionLiveRegionId,
    selectionLiveRegionMessage,
    selectionCapDescriptionId,
    getRowCanSelect,
    enterSelectionMode,
    handleExitSelectionMode: exitBulkSelectionMode,
    onRowSelectionChange,
    onRowSelectionStateChange,
    removeFromSelection,
  } = useContentOverviewBulkSelection<T>(visibleRowIds)
  const [bulkAccessOpen, setBulkAccessOpen] = useState(false)
  const [openExtensionId, setOpenExtensionId] = useState<string | null>(null)
  const supportsBulkCampaignAccess = supportsContentBulkCampaignAccess(contentTypeKey)

  const openBulkAccessDialog = useCallback(() => {
    setBulkAccessOpen(true)
  }, [])

  const handleBulkAccessApplyComplete = useCallback(
    (result: { updatedIds: string[]; fullSuccess: boolean }) => {
      removeFromSelection(result.updatedIds)

      if (result.fullSuccess) {
        setBulkAccessOpen(false)
        exitBulkSelectionMode()
      }
    },
    [exitBulkSelectionMode, removeFromSelection],
  )

  const handleExtensionApplyComplete = useCallback(
    (outcomes: ActionApplyOutcome<unknown, ActionTargetFailure>[]) => {
      const { updated, blocked, failed } = partitionApplyOutcomes(outcomes)
      removeFromSelection(updated.map((outcome) => outcome.targetId))

      if (updated.length > 0 && blocked.length === 0 && failed.length === 0) {
        setOpenExtensionId(null)
        exitBulkSelectionMode()
      }
    },
    [exitBulkSelectionMode, removeFromSelection],
  )

  const handleExitSelectionMode = useCallback(() => {
    setBulkAccessOpen(false)
    setOpenExtensionId(null)
    exitBulkSelectionMode()
  }, [exitBulkSelectionMode])

  const additionalBulkActions = useMemo(() => {
    if (!canManage || selectedCount === 0) {
      return [] as OverviewBulkAction[]
    }

    return bulkExtensions.map((extension) => ({
      ...extension.menuAction,
      onSelect: () => setOpenExtensionId(extension.menuAction.id),
    }))
  }, [bulkExtensions, canManage, selectedCount])

  const handleAdvancedOpenChange = useCallback(
    (open: boolean) => {
      setPreferences((current) => {
        const { next, changed } = applyOverviewAdvancedOpenPreferences(current, open)
        if (!changed) return current

        persistContentOverviewPreferences(contentTypeKey, next)
        return next
      })
    },
    [contentTypeKey],
  )

  const handleColumnChange = useCallback(
    (state: ColumnChangeState) => {
      setPreferences((current) => {
        const { next, changed } = applyOverviewColumnChangePreferences(current, state)
        if (!changed) return current

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

  useEffect(() => {
    restoreFocusRef.current = restoreFocusAfterRowRemoved
  })

  const registerActionTrigger = useCallback((rowId: string, element: HTMLButtonElement | null) => {
    if (element) {
      actionTriggerRefs.current.set(rowId, element)
      return
    }

    actionTriggerRefs.current.delete(rowId)
  }, [])

  const tablePageSize: ContentOverviewPageSize =
    preferences.pageSize ?? CONTENT_OVERVIEW_PREFERENCES_DEFAULTS.pageSize ?? 20

  const resultSupplement = useMemo(
    () =>
      buildContentOverviewHiddenSupplement({
        scope,
        campaignAvailability,
        campaignAvailabilityFilterId,
        actions,
      }),
    [actions, campaignAvailability, campaignAvailabilityFilterId, scope],
  )

  const emptyState = useCallback(
    () =>
      buildContentOverviewEmptyState({
        campaignAvailability,
        scope,
        pluralNoun,
        campaignAvailabilityFilterId,
        actions,
      }),
    [actions, campaignAvailability, campaignAvailabilityFilterId, pluralNoun, scope],
  )

  return (
    <div ref={tableRootRef} tabIndex={-1} className="flex flex-col gap-3 outline-none">
      <CatalogOverviewFilterChrome
        filterSchema={filterSchema}
        filterState={filterState}
        onFilterChange={handleFilterValueChange}
        onResetFilters={() => actions.resetFilters()}
        advancedOpen={hasAdvancedFields ? advancedOpen : false}
        onAdvancedOpenChange={hasAdvancedFields ? handleAdvancedOpenChange : () => undefined}
      />

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
        resultSupplement={resultSupplement}
        selectionMode={selectionMode}
        rowSelection={rowSelection}
        selectionLimit={selectionLimit}
        selectionLiveRegionId={selectionLiveRegionId}
        selectionLiveRegionMessage={selectionLiveRegionMessage}
        selectionCapDescriptionId={selectionCapDescriptionId}
        onEnterSelectionMode={enterSelectionMode}
        onExitSelectionMode={handleExitSelectionMode}
        onRowSelectionChange={onRowSelectionChange}
        onRowSelectionStateChange={onRowSelectionStateChange}
        getRowCanSelect={getRowCanSelect}
        onEditCampaignAccess={
          canManage && supportsBulkCampaignAccess && selectedCount > 0
            ? openBulkAccessDialog
            : undefined
        }
        additionalBulkActions={additionalBulkActions}
        getEditHref={getEditHref}
        onColumnChange={handleColumnChange}
        caption={caption}
        emptyState={emptyState}
        restoreFocusRef={restoreFocusRef}
        registerActionTrigger={registerActionTrigger}
        selectTriggerRef={selectTriggerRef}
      />

      {canManage && supportsBulkCampaignAccess ? (
        <BulkCampaignAccessDialog
          open={bulkAccessOpen}
          onOpenChange={setBulkAccessOpen}
          campaignId={campaignId}
          targetType={contentTypeKey}
          contentTypeKey={contentTypeKey}
          itemLabelPlural={pluralNoun}
          selectedRows={selectedRows}
          onApplyComplete={handleBulkAccessApplyComplete}
        />
      ) : null}

      {canManage
        ? bulkExtensions.map((extension) => (
            <div key={extension.menuAction.id}>
              {extension.renderDialog({
                open: openExtensionId === extension.menuAction.id,
                onOpenChange: (open) => setOpenExtensionId(open ? extension.menuAction.id : null),
                campaignId,
                selectedRows: selectedRows,
                campaignRows: data,
                onApplyComplete: handleExtensionApplyComplete,
              })}
            </div>
          ))
        : null}
    </div>
  )
}
