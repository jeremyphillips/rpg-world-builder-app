'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CAMPAIGN_AVAILABILITY_FILTER_DEFAULT,
  partitionApplyOutcomes,
  supportsContentBulkCampaignAccess,
  type ActionApplyOutcome,
  type ActionTargetFailure,
  type CampaignAvailabilityFilter,
  type WithCampaignAccess,
} from '@rpg/contracts'
import { type ColumnDef, type ColumnChangeState } from '@rpg/ui'
import {
  applyFilterSchema,
  getEffectiveFilterValue,
  getSchemaFieldsByPlacement,
  type FilterFieldId,
} from '@rpg/ui/filters'

import { getContentTypeMidSentenceLabel } from '../../content-type-labels'
import { useCanManageCampaign } from '@/features/campaign'
import type { OverviewBulkAction } from '@/lib/overview/overview-bulk-actions-menu'
import {
  applyOverviewAdvancedOpenPreferences,
  applyOverviewColumnChangePreferences,
} from '@/lib/overview-preferences'

import {
  buildContentOverviewColumnSchema,
  getContentOverviewSortableColumnIds,
} from '../content-overview-columns.lib'
import { useOverviewColumnsWithNameContext } from '../content-overview-columns.client'
import { filterCatalogRowsForViewer } from '../filter-catalog-rows-for-viewer'
import { useContentViewer } from './use-content-viewer'
import {
  CONTENT_OVERVIEW_PREFERENCES_DEFAULTS,
  hydrateContentOverviewPreferences,
  persistContentOverviewPreferences,
  type ContentOverviewPageSize,
  type ContentOverviewPreferences,
} from '../content-overview-preferences'
import {
  buildContentOverviewEmptyState,
  buildContentOverviewHiddenSupplement,
} from '../../campaign-access/overview/content-overview-availability-ui.lib'
import { useContentOverviewBulkSelection } from './use-content-overview-bulk-selection'
import {
  CAMPAIGN_AVAILABILITY_FILTER_ID,
  deriveCampaignAvailabilityScope,
} from '../content-availability-table.lib'
import type { ContentBase } from '../content-table-config'
import { useContentOverviewQueryState } from './use-content-overview-query-state.client'
import { focusNextOverviewRowActionTrigger } from '../content-overview-table-focus.lib'
import type { ContentOverviewBaseFilterState } from '../content-overview-filter-schema'
import type {
  ContentOverviewBulkExtension,
  ContentOverviewTableProps,
} from '../content-overview-table.types'

const DEFAULT_OVERVIEW_SORT = { id: 'name' } as const

export function useContentOverviewTable<
  T extends WithCampaignAccess<ContentBase> & { id: string },
  TFilters extends ContentOverviewBaseFilterState,
>({
  contentTypeKey,
  campaignId,
  columns,
  filterSchema,
  data,
  caption,
  getEditHref,
  bulkExtensions = [],
  tableRootRef,
  actionTriggerRefs,
}: ContentOverviewTableProps<T, TFilters> & {
  tableRootRef: React.RefObject<HTMLDivElement | null>
  actionTriggerRefs: React.MutableRefObject<Map<string, HTMLButtonElement>>
}) {
  const selectTriggerRef = useRef<HTMLButtonElement>(null)
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
      focusNextOverviewRowActionTrigger({
        removedRowId,
        visibleRowIds: visibleRows.map((row) => row.id),
        actionTriggerRefs: actionTriggerRefs.current,
        tableRoot: tableRootRef.current,
      })
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

  return {
    actions,
    additionalBulkActions,
    bulkAccessOpen,
    bulkExtensions: bulkExtensions as ContentOverviewBulkExtension<T>[],
    campaignAvailability,
    campaignId,
    canManage,
    caption,
    contentTypeKey,
    data,
    emptyState,
    filterSchema,
    filterState,
    getEditHref,
    getRowCanSelect,
    handleAdvancedOpenChange,
    handleBulkAccessApplyComplete,
    handleColumnChange,
    handleExitSelectionMode,
    handleExtensionApplyComplete,
    handleFilterValueChange,
    hasAdvancedFields,
    advancedOpen,
    itemLabel,
    onRowSelectionChange,
    onRowSelectionStateChange,
    openBulkAccessDialog: () => setBulkAccessOpen(true),
    openExtensionId,
    overviewColumns,
    pluralNoun,
    preferences,
    registerActionTrigger,
    restoreFocusRef,
    resultSupplement,
    selectedCount,
    selectedRows,
    selectionCapDescriptionId,
    selectionLimit,
    selectionLiveRegionId,
    selectionLiveRegionMessage,
    selectionMode,
    rowSelection,
    selectTriggerRef,
    setBulkAccessOpen,
    setOpenExtensionId,
    supportsBulkCampaignAccess,
    tablePageSize,
    visibleRows,
    enterSelectionMode,
  }
}
