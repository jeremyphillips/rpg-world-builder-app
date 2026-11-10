import type { ReactNode } from 'react'
import { fieldGroupFlexStackClasses } from '@rpg/ui'

import type { DetailOverflowMenuEntry } from '../../lib/detail/detail-overflow-actions'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
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
  onDuplicate?: () => void
  overflowActions?: readonly DetailOverflowMenuEntry[]
  invalidItemCount?: number
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
  onDuplicate,
  overflowActions,
  invalidItemCount,
  renderDetail,
  leadingContent,
  deleteDialog,
}: NestedResourceMasterDetailEditorProps) {
  const detailColumn =
    selectedRowId && selectedIdentity ? (
      <MasterDetailEditorShell
        itemNoun={itemNoun}
        selectedIdentity={selectedIdentity}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        overflowActions={overflowActions}
      >
        {renderDetail({ rowId: selectedRowId })}
      </MasterDetailEditorShell>
    ) : (
      <MasterDetailEditorShell itemNoun={itemNoun} />
    )

  const masterDetailGrid = (
    <MasterDetailGrid>
      <MasterDetailListPanel
        items={items}
        selectedItemId={selectedRowId}
        listTitle={listTitle}
        ariaLabel={ariaLabel}
        addLabel={addLabel}
        itemNoun={itemNoun}
        onAdd={onAdd}
        onSelectItem={onSelectRow}
        countSupplement={countSupplement}
        invalidItemCount={invalidItemCount}
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
