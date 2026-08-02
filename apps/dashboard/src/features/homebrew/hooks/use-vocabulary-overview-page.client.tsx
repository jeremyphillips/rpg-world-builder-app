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
import { OverviewBulkActionsMenu } from '@/lib/overview/overview-bulk-actions-menu.client'
import {
  overviewUnavailableNameCellClassName,
  overviewUnavailableRowClassName,
} from '@/lib/overview/overview-unavailable-chrome'

import { VocabularyRowActions } from '../components/vocabulary-row-actions.client'
import { useVocabularyMutations, useVocabularySet } from '../hooks/use-vocabulary-set'
import {
  VOCABULARY_BULK_ACTIONS_MENU_LABEL,
  VOCABULARY_BULK_ACTION_EDIT_AVAILABILITY_LABEL,
} from '../lib/vocabulary/labels'
import { vocabularyColumns } from '../lib/vocabulary/vocabulary-overview-columns'
import { VOCABULARY_OVERVIEW_FILTER_SCHEMA } from '../lib/vocabulary/vocabulary-overview-filter-schema'

const VOCABULARY_BULK_SELECTION_LIMIT = 50

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
      }),
    [
      campaignId,
      capabilities.batchUsageCounting,
      onEdit,
      setId,
      showEdit,
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

  const rowActions = useCallback(
    (row: VocabularyOptionWithUsage) => (
      <VocabularyRowActions
        campaignId={campaignId}
        setId={setId}
        entry={row}
        canManage={showRowActions}
        onDelete={(entry) => {
          const entryLabel = entry.label
          void mutations.deleteEntry.mutateAsync(entry.id, {
            onSuccess: () => notifyVocabularyEntryDeleted(entryLabel),
          })
        }}
      />
    ),
    [campaignId, mutations.deleteEntry, setId, showRowActions],
  )

  const selectionConfig =
    canManage && capabilities.bulkAvailability
      ? {
          enabled: true as const,
          selectionMode,
          rowSelection,
          selectionLimit: VOCABULARY_BULK_SELECTION_LIMIT,
          selectionLiveRegionId,
          selectionLiveRegionMessage: selectionMode
            ? `Selection mode. ${selectedCount} item${selectedCount === 1 ? '' : 's'} selected.`
            : '',
          selectionCapDescriptionId,
          onEnterSelectionMode: enterSelectionMode,
          onExitSelectionMode: exitSelectionMode,
          onRowSelectionChange,
          onRowSelectionStateChange,
          getRowCanSelect,
          selectTriggerRef,
          getSelectRowLabel: (row: VocabularyOptionWithUsage) => row.label,
          bulkActionsMenu: (
            <OverviewBulkActionsMenu
              menuLabel={VOCABULARY_BULK_ACTIONS_MENU_LABEL}
              actions={[
                {
                  id: 'edit-availability',
                  label: VOCABULARY_BULK_ACTION_EDIT_AVAILABILITY_LABEL,
                  onSelect: () => setBulkOpen(true),
                },
              ]}
            />
          ),
        }
      : undefined

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
