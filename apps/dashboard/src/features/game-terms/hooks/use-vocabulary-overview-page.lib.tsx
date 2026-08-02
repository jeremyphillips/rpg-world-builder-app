import type { VocabularyOptionSetId, VocabularyOptionWithUsage } from '@rpg/contracts'
import type { RefObject } from 'react'

import type { OverviewRowSelectionState } from '@/lib/data-table/use-overview-selection'
import { OverviewBulkActionsMenu } from '@/lib/overview/overview-bulk-actions-menu.client'

import {
  VOCABULARY_BULK_ACTIONS_MENU_LABEL,
  VOCABULARY_BULK_ACTION_EDIT_AVAILABILITY_LABEL,
} from '../lib/labels'

import { VocabularyRowActions } from '../components/vocabulary-row-actions.client'

const VOCABULARY_BULK_SELECTION_LIMIT = 50

export { VOCABULARY_BULK_SELECTION_LIMIT }

type VocabularyBulkSelectionConfigInput = {
  canManage: boolean
  bulkAvailability: boolean
  selectionMode: boolean
  rowSelection: Record<string, boolean>
  selectedCount: number
  selectionLiveRegionId: string
  selectionCapDescriptionId: string
  enterSelectionMode: () => void
  exitSelectionMode: () => void
  onRowSelectionChange: (rows: VocabularyOptionWithUsage[]) => void
  onRowSelectionStateChange: (state: OverviewRowSelectionState) => void
  getRowCanSelect: (row: VocabularyOptionWithUsage) => boolean
  selectTriggerRef: RefObject<HTMLButtonElement | null>
  onOpenBulkDialog: () => void
}

export function buildVocabularyBulkSelectionConfig(input: VocabularyBulkSelectionConfigInput) {
  const {
    canManage,
    bulkAvailability,
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
    selectTriggerRef,
    onOpenBulkDialog,
  } = input

  if (!canManage || !bulkAvailability) {
    return undefined
  }

  return {
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
            onSelect: onOpenBulkDialog,
          },
        ]}
      />
    ),
  }
}

type VocabularyRowActionsRendererInput = {
  campaignId: string
  setId: VocabularyOptionSetId
  showRowActions: boolean
  onDelete: (entryId: string, entryLabel: string) => void
}

export function createVocabularyRowActionsRenderer({
  campaignId,
  setId,
  showRowActions,
  onDelete,
}: VocabularyRowActionsRendererInput) {
  return (row: VocabularyOptionWithUsage) => (
    <VocabularyRowActions
      campaignId={campaignId}
      setId={setId}
      entry={row}
      canManage={showRowActions}
      onDelete={(entry) => onDelete(entry.id, entry.label)}
    />
  )
}
