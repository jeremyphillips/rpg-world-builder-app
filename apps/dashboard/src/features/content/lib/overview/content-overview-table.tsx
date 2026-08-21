import { memo, useCallback, useMemo, useRef, type ReactNode } from 'react'
import {
  type CampaignAvailabilityFilter,
  type ContentTypeKey,
  type WithCampaignAccess,
} from '@rpg/contracts'
import { type ColumnDef, type ColumnChangeState, type DataTableUtilityControls } from '@rpg/ui'

import { CatalogOverviewFilterChrome } from '@/lib/data-table/catalog-overview-table'
import {
  overviewUnavailableNameCellClassName,
  overviewUnavailableRowClassName,
} from '@/lib/overview/overview-unavailable-chrome'
import { OverviewResultSummary } from '@/lib/data-table/overview-result-summary'
import { OverviewSelectionCluster } from '@/lib/data-table/overview-selection-cluster'
import { OverviewTableFrame } from '@/lib/data-table/overview-table-frame'
import type { OverviewBulkAction } from '@/lib/overview/overview-bulk-actions-menu'

import { ContentOverviewRowActions } from './content-overview-row-actions'
import { ContentBulkActionsMenu } from './content-bulk-actions-menu'
import { ContentOverviewTableBulkDialogs } from './content-overview-table-bulk-dialogs'
import type {
  ContentOverviewBulkExtension,
  ContentOverviewTableProps,
} from './content-overview-table.types'
import type { ContentBase } from './content-table-config'
import type { ContentOverviewBaseFilterState } from './content-overview-filter-schema'
import type {
  ContentOverviewPageSize,
  ContentOverviewPreferences,
} from './content-overview-preferences'
import { useContentOverviewTable } from './hooks/use-content-overview-table'

export type {
  ContentOverviewBulkExtension,
  ContentOverviewBulkExtensionRenderContext,
  ContentOverviewTableProps,
} from './content-overview-table.types'

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

export function ContentOverviewTable<
  T extends WithCampaignAccess<ContentBase> & { id: string },
  TFilters extends ContentOverviewBaseFilterState = ContentOverviewBaseFilterState,
>(props: ContentOverviewTableProps<T, TFilters>) {
  const tableRootRef = useRef<HTMLDivElement>(null)
  const actionTriggerRefs = useRef(new Map<string, HTMLButtonElement>())
  const model = useContentOverviewTable({
    ...props,
    bulkExtensions: props.bulkExtensions ?? EMPTY_BULK_EXTENSIONS,
    tableRootRef,
    actionTriggerRefs,
  })

  return (
    <div ref={tableRootRef} tabIndex={-1} className="flex flex-col gap-3 outline-none">
      <CatalogOverviewFilterChrome
        filterSchema={props.filterSchema}
        filterState={model.filterState}
        onFilterChange={model.handleFilterValueChange}
        onResetFilters={() => model.actions.resetFilters()}
        advancedOpen={model.hasAdvancedFields ? model.advancedOpen : false}
        onAdvancedOpenChange={
          model.hasAdvancedFields ? model.handleAdvancedOpenChange : () => undefined
        }
      />

      <ContentOverviewDataTable
        columns={model.overviewColumns}
        data={model.visibleRows}
        pageSize={model.tablePageSize}
        columnVisibility={model.preferences.columnVisibility}
        columnOrder={model.preferences.columnOrder}
        canManage={model.canManage}
        campaignId={props.campaignId}
        contentTypeKey={props.contentTypeKey}
        itemLabel={model.itemLabel}
        campaignAvailability={model.campaignAvailability}
        resultSupplement={model.resultSupplement}
        selectionMode={model.selectionMode}
        rowSelection={model.rowSelection}
        selectionLimit={model.selectionLimit}
        selectionLiveRegionId={model.selectionLiveRegionId}
        selectionLiveRegionMessage={model.selectionLiveRegionMessage}
        selectionCapDescriptionId={model.selectionCapDescriptionId}
        onEnterSelectionMode={model.enterSelectionMode}
        onExitSelectionMode={model.handleExitSelectionMode}
        onRowSelectionChange={model.onRowSelectionChange}
        onRowSelectionStateChange={model.onRowSelectionStateChange}
        getRowCanSelect={model.getRowCanSelect}
        onEditCampaignAccess={
          model.canManage && model.supportsBulkCampaignAccess && model.selectedCount > 0
            ? model.openBulkAccessDialog
            : undefined
        }
        additionalBulkActions={model.additionalBulkActions}
        getEditHref={props.getEditHref}
        onColumnChange={model.handleColumnChange}
        caption={props.caption}
        emptyState={model.emptyState}
        restoreFocusRef={model.restoreFocusRef}
        registerActionTrigger={model.registerActionTrigger}
        selectTriggerRef={model.selectTriggerRef}
      />

      <ContentOverviewTableBulkDialogs
        bulkAccessOpen={model.bulkAccessOpen}
        bulkExtensions={model.bulkExtensions}
        campaignId={props.campaignId}
        canManage={model.canManage}
        contentTypeKey={props.contentTypeKey}
        data={props.data}
        itemLabelPlural={model.pluralNoun}
        onBulkAccessApplyComplete={model.handleBulkAccessApplyComplete}
        onExtensionApplyComplete={model.handleExtensionApplyComplete}
        openExtensionId={model.openExtensionId}
        selectedRows={model.selectedRows}
        setBulkAccessOpen={model.setBulkAccessOpen}
        setOpenExtensionId={model.setOpenExtensionId}
      />
    </div>
  )
}
