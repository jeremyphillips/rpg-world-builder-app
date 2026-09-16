import type { ReactNode, RefObject } from 'react'

import {
  DetailOverflowMenu,
  detailOverflowDeleteAction,
} from '../../lib/detail/detail-overflow-menu'
import {
  joinMasterDetailItemMeta,
  type MasterDetailItemMeta,
} from '../../lib/master-detail/master-detail-item-meta'
import { masterDetailItemNounLabel } from '../../lib/master-detail/master-detail-constants'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import type { MasterDetailAvailabilityPresentation } from '../../lib/master-detail/master-detail-availability.types'
import { MasterDetailEditorEmptyState } from './master-detail-editor-empty-state'
import { MasterDetailEditorStatusRow } from './master-detail-editor-status-row'
import {
  masterDetailEditorBodyClasses,
  masterDetailEditorEmptyShellClasses,
  masterDetailEditorIdentityClasses,
  masterDetailEditorIdentityCopyClasses,
  masterDetailEditorMetaClasses,
  masterDetailEditorShellClassName,
  masterDetailEditorTitleClasses,
} from './master-detail-editor-panel.variants'

export interface MasterDetailEditorIdentity {
  title: string
  meta?: MasterDetailItemMeta
  deletable?: boolean
  availability?: MasterDetailAvailabilityPresentation
  onAvailabilityChange?: () => void
  /** Unique presentation-path issue count for the selected row. */
  issueCount?: number
}

export interface MasterDetailEditorShellProps {
  itemNoun: MasterDetailItemNounTerm
  selectedIdentity?: MasterDetailEditorIdentity
  onDelete?: () => void
  bodyRef?: RefObject<HTMLDivElement | null>
  children?: ReactNode
}

function MasterDetailEditorIdentityHeader({
  identity,
  itemNoun,
  onDelete,
}: {
  identity: MasterDetailEditorIdentity
  itemNoun: MasterDetailItemNounTerm
  onDelete?: () => void
}) {
  const metaLine = identity.meta ? joinMasterDetailItemMeta(identity.meta) : undefined
  const deletable = identity.deletable !== false && Boolean(onDelete)
  const itemNounLabel = masterDetailItemNounLabel(itemNoun)

  return (
    <div className={masterDetailEditorIdentityClasses}>
      <div className={masterDetailEditorIdentityCopyClasses}>
        <div className={masterDetailEditorTitleClasses}>{identity.title}</div>
        {metaLine ? <div className={masterDetailEditorMetaClasses}>{metaLine}</div> : null}
        <MasterDetailEditorStatusRow
          availability={identity.availability}
          onAvailabilityChange={identity.onAvailabilityChange}
          issueCount={identity.issueCount}
        />
      </div>
      {deletable && onDelete ? (
        <DetailOverflowMenu
          triggerLabel={`Actions for ${identity.title}`}
          actions={[detailOverflowDeleteAction(`Delete ${itemNounLabel}`, onDelete)]}
        />
      ) : null}
    </div>
  )
}

/**
 * Bordered detail rail shell: identity header with overflow delete, and a body slot.
 * Renders the shared empty state when nothing is selected.
 */
export function MasterDetailEditorShell({
  itemNoun,
  selectedIdentity,
  onDelete,
  bodyRef,
  children,
}: MasterDetailEditorShellProps) {
  const hasSelectedRow = Boolean(selectedIdentity)

  return (
    <div
      className={
        hasSelectedRow ? masterDetailEditorShellClassName() : masterDetailEditorEmptyShellClasses
      }
    >
      {hasSelectedRow && selectedIdentity ? (
        <>
          <MasterDetailEditorIdentityHeader
            identity={selectedIdentity}
            itemNoun={itemNoun}
            onDelete={onDelete}
          />
          <div ref={bodyRef} className={masterDetailEditorBodyClasses}>
            {children}
          </div>
        </>
      ) : (
        <MasterDetailEditorEmptyState itemNoun={itemNoun} />
      )}
    </div>
  )
}
