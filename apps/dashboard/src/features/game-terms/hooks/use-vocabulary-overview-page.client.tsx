'use client'

import { useCallback, useId, useMemo, useRef, useState } from 'react'
import {
  getVocabularySetCapability,
  type VocabularyOptionSetId,
  type VocabularyOptionWithUsage,
} from '@rpg/contracts'
import { useFilterState } from '@rpg/ui/filters'

import { ROUTES } from '@/app/routes'
import { useOverviewSelection } from '@/lib/data-table/use-overview-selection'
import { notifyVocabularyEntryDeleted } from '@/lib/notify'
import {
  overviewUnavailableNameCellClassName,
  overviewUnavailableRowClassName,
} from '@/lib/overview/overview-unavailable-chrome'

import { useVocabularyMutations, useVocabularySet } from '@/features/vocabulary'

import { vocabularyColumns } from '../lib/vocabulary/vocabulary-overview-columns'
import { VOCABULARY_OVERVIEW_FILTER_SCHEMA } from '../lib/vocabulary/vocabulary-overview-filter-schema'
import {
  buildVocabularyBulkSelectionConfig,
  createVocabularyRowActionsRenderer,
  VOCABULARY_BULK_SELECTION_LIMIT,
} from './use-vocabulary-overview-page.lib'

export type UseVocabularyOverviewPageOptions = {
  campaignId: string
  setId: VocabularyOptionSetId
  canManage: boolean
  onEdit: (entry: VocabularyOptionWithUsage) => void
}

export function useVocabularyOverviewPage({
  campaignId,
  setId,
  canManage,
  onEdit,
}: UseVocabularyOverviewPageOptions) {
  const capabilities = getVocabularySetCapability(setId)
  const { data: vocabularySet } = useVocabularySet(campaignId, setId)
  const mutations = useVocabularyMutations(campaignId, setId)
  const [bulkOpen, setBulkOpen] = useState(false)
  const selectionLiveRegionId = useId()
  const selectionCapDescriptionId = useId()
  const selectTriggerRef = useRef<HTMLButtonElement>(null)
  const tableRows = vocabularySet?.options ?? []

  const {
    state: filterState,
    setValue: setFilterField,
    reset: resetFilters,
  } = useFilterState(VOCABULARY_OVERVIEW_FILTER_SCHEMA, { data: tableRows })

  const {
    selectionMode,
    rowSelection,
    selectedRows,
    selectedCount,
    getRowCanSelect,
    enterSelectionMode,
    exitSelectionMode,
    onRowSelectionChange,
    onRowSelectionStateChange,
    removeFromSelection,
  } = useOverviewSelection<VocabularyOptionWithUsage>({
    visibleRowIds: useMemo(() => new Set(tableRows.map((row) => row.id)), [tableRows]),
    selectionLimit: VOCABULARY_BULK_SELECTION_LIMIT,
  })

  const showEdit = canManage && capabilities.edit

  const columns = useMemo(
    () =>
      vocabularyColumns({
        nameHref: (entry) => ROUTES.gameTerms.detail(campaignId, setId, entry.id),
        onEdit: showEdit ? onEdit : undefined,
        canEdit: showEdit,
        usageSummaryLabels: capabilities.batchUsageCounting
          ? vocabularySet?.usageSummaryLabels
          : undefined,
        overviewUsageScope: capabilities.batchUsageCounting
          ? vocabularySet?.overviewUsageScope
          : undefined,
      }),
    [
      campaignId,
      capabilities.batchUsageCounting,
      onEdit,
      setId,
      showEdit,
      vocabularySet?.overviewUsageScope,
      vocabularySet?.usageSummaryLabels,
    ],
  )

  const getRowClassName = useCallback(
    (row: { original: VocabularyOptionWithUsage }) =>
      overviewUnavailableRowClassName(row.original.status === 'active'),
    [],
  )

  const getCellClassName = useCallback(
    (cell: { column: { id: string }; row: { original: VocabularyOptionWithUsage } }) =>
      overviewUnavailableNameCellClassName(cell.row.original.status === 'active', cell.column.id),
    [],
  )

  const showRowActions = canManage && (capabilities.delete || capabilities.availability)

  const handleDelete = useCallback(
    (entryId: string, entryLabel: string) => {
      void mutations.deleteEntry.mutateAsync(entryId, {
        onSuccess: () => notifyVocabularyEntryDeleted(entryLabel),
      })
    },
    [mutations.deleteEntry],
  )

  const rowActions = useCallback(
    (row: VocabularyOptionWithUsage) =>
      createVocabularyRowActionsRenderer({
        campaignId,
        setId,
        showRowActions,
        onDelete: handleDelete,
      })(row),
    [campaignId, handleDelete, setId, showRowActions],
  )

  const selectionConfigCore = useMemo(
    () =>
      buildVocabularyBulkSelectionConfig({
        canManage,
        bulkAvailability: capabilities.bulkAvailability,
        selectionMode,
        rowSelection,
        selectedCount,
        selectionLiveRegionId,
        selectionCapDescriptionId,
        enterSelectionMode,
        exitSelectionMode,
        onRowSelectionChange,
        onRowSelectionStateChange,
        getRowCanSelect,
        selectTriggerRef: { current: null },
        onOpenBulkDialog: () => setBulkOpen(true),
      }),
    [
      canManage,
      capabilities.bulkAvailability,
      enterSelectionMode,
      exitSelectionMode,
      getRowCanSelect,
      onRowSelectionChange,
      onRowSelectionStateChange,
      rowSelection,
      selectedCount,
      selectionCapDescriptionId,
      selectionLiveRegionId,
      selectionMode,
    ],
  )

  const selectionConfig =
    selectionConfigCore === undefined ? undefined : { ...selectionConfigCore, selectTriggerRef }

  return {
    capabilities,
    columns,
    tableRows,
    filterState,
    setFilterField,
    resetFilters,
    getRowClassName,
    getCellClassName,
    rowActions: showRowActions ? rowActions : undefined,
    selectionConfig,
    bulkOpen,
    setBulkOpen,
    selectedRows,
    removeFromSelection,
    exitSelectionMode,
    invalidateSet: mutations.invalidateSet,
  }
}
