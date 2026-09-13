import type { ReactNode } from 'react'
import { useCallback } from 'react'
import { fieldGroupFlexStackClasses } from '@rpg/ui'

import {
  resolveSelectedIndexById,
  selectIdAtIndex,
} from '../../lib/master-detail/resolve-master-detail-selected-index'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import { MasterDetailEditorEmptyState } from './master-detail-editor-empty-state'
import {
  MasterDetailEditorShell,
  type MasterDetailEditorIdentity,
} from './master-detail-editor-shell'
import { MasterDetailGrid } from './master-detail-grid'
import { MasterDetailListPanel, type MasterDetailListItem } from './master-detail-list-panel'

export type { MasterDetailEditorIdentity }

export interface NestedResourceMasterDetailEditorProps {
  items: MasterDetailListItem[]
  selectedRowId: string | null
  onSelectRow: (rowId: string) => void
  onAdd: () => void
  listTitle: ReactNode
  ariaLabel: string
  addLabel: string
  itemNoun: MasterDetailItemNounTerm
  countSupplement?: ReactNode
  selectedIdentity?: MasterDetailEditorIdentity
  onDelete?: () => void
  showValidationBanner?: boolean
  renderDetail: (ctx: { rowId: string }) => ReactNode
  leadingContent?: ReactNode
  deleteDialog?: ReactNode
}

/**
 * Master-detail editor for independently persisted nested API resources: list on
 * the left, domain-owned detail body on the right. Does not fetch, mutate, save,
 * or bind to react-hook-form field arrays.
 */
export function NestedResourceMasterDetailEditor({
  items,
  selectedRowId,
  onSelectRow,
  onAdd,
  listTitle,
  ariaLabel,
  addLabel,
  itemNoun,
  countSupplement,
  selectedIdentity,
  onDelete,
  showValidationBanner = false,
  renderDetail,
  leadingContent,
  deleteDialog,
}: NestedResourceMasterDetailEditorProps) {
  const selectedIndex = resolveSelectedIndexById(items, selectedRowId)

  const handleSelect = useCallback(
    (index: number) => {
      const rowId = selectIdAtIndex(items, index)
      if (rowId) onSelectRow(rowId)
    },
    [items, onSelectRow],
  )

  const detailColumn =
    selectedRowId && selectedIdentity ? (
      <MasterDetailEditorShell
        itemNoun={itemNoun}
        selectedIdentity={selectedIdentity}
        onDelete={onDelete}
        showValidationBanner={showValidationBanner}
      >
        {renderDetail({ rowId: selectedRowId })}
      </MasterDetailEditorShell>
    ) : (
      <MasterDetailEditorEmptyState itemNoun={itemNoun} />
    )

  const masterDetailGrid = (
    <MasterDetailGrid>
      <MasterDetailListPanel
        items={items}
        selectedIndex={selectedIndex}
        listTitle={listTitle}
        ariaLabel={ariaLabel}
        addLabel={addLabel}
        itemNoun={itemNoun}
        onAdd={onAdd}
        onSelect={handleSelect}
        countSupplement={countSupplement}
      />
      {detailColumn}
    </MasterDetailGrid>
  )

  const content = leadingContent ? (
    <div className={fieldGroupFlexStackClasses}>
      {leadingContent}
      {masterDetailGrid}
    </div>
  ) : (
    masterDetailGrid
  )

  return (
    <>
      {content}
      {deleteDialog}
    </>
  )
}
