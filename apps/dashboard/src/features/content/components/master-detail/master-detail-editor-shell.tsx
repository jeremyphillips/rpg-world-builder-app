import type { ReactNode, RefObject } from 'react'
import { cn, panelVariants } from '@rpg/ui'

import { DetailOverflowMenu } from '../../lib/detail/detail-overflow-menu'
import {
  detailOverflowDeleteAction,
  detailOverflowDuplicateAction,
  type DetailOverflowMenuEntry,
} from '../../lib/detail/detail-overflow-actions'
import {
  joinMasterDetailItemMeta,
  type MasterDetailItemMeta,
} from '../../lib/master-detail/master-detail-item-meta'
import { masterDetailItemNounLabel } from '../../lib/master-detail/master-detail-constants'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import type { MasterDetailAvailabilityPresentation } from '../../lib/master-detail/master-detail-availability.types'
import { MasterDetailEditorEmptyState } from './master-detail-editor-empty-state'
import { MasterDetailEditorStatusRow } from './master-detail-editor-status-row'

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
  /** Copies the selected row as a new homebrew row. */
  onDuplicate?: () => void
  /** Leading overflow entries, rendered before duplicate and delete. */
  overflowActions?: readonly DetailOverflowMenuEntry[]
  bodyRef?: RefObject<HTMLDivElement | null>
  children?: ReactNode
}

function MasterDetailEditorIdentityHeader({
  identity,
  itemNoun,
  onDelete,
  onDuplicate,
  overflowActions,
}: {
  identity: MasterDetailEditorIdentity
  itemNoun: MasterDetailItemNounTerm
  onDelete?: () => void
  onDuplicate?: () => void
  overflowActions?: readonly DetailOverflowMenuEntry[]
}) {
  const metaLine = identity.meta ? joinMasterDetailItemMeta(identity.meta) : undefined
  const deletable = identity.deletable !== false && Boolean(onDelete)
  const itemNounLabel = masterDetailItemNounLabel(itemNoun)
  const leadingActions: DetailOverflowMenuEntry[] = [
    ...(overflowActions ?? []),
    ...(onDuplicate
      ? [detailOverflowDuplicateAction(`Duplicate ${itemNounLabel}`, onDuplicate)]
      : []),
  ]
  const menuActions: DetailOverflowMenuEntry[] = [
    ...leadingActions,
    ...(deletable && onDelete
      ? [
          {
            ...detailOverflowDeleteAction(`Delete ${itemNounLabel}`, onDelete),
            separatorBefore: leadingActions.length > 0,
          },
        ]
      : []),
  ]

  return (
    <div className="flex items-start justify-between gap-3 border-b ui-border--subtle px-4 py-3">
      <div className="min-w-0 space-y-0.5">
        <div className="truncate text-lg font-medium text-foreground">{identity.title}</div>
        {metaLine ? <div className="truncate text-style-caption">{metaLine}</div> : null}
        <MasterDetailEditorStatusRow
          availability={identity.availability}
          onAvailabilityChange={identity.onAvailabilityChange}
          issueCount={identity.issueCount}
        />
      </div>
      {menuActions.length > 0 ? (
        <DetailOverflowMenu triggerLabel={`Actions for ${identity.title}`} actions={menuActions} />
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
  onDuplicate,
  overflowActions,
  bodyRef,
  children,
}: MasterDetailEditorShellProps) {
  const hasSelectedRow = Boolean(selectedIdentity)

  return (
    <div
      className={
        hasSelectedRow
          ? cn(
              panelVariants({ tone: 'quiet', density: 'comfortable', bleed: true }),
              'self-start overflow-hidden text-foreground md:col-span-2',
            )
          : 'flex min-h-48 flex-col self-start bg-transparent md:col-span-2'
      }
    >
      {hasSelectedRow && selectedIdentity ? (
        <>
          <MasterDetailEditorIdentityHeader
            identity={selectedIdentity}
            itemNoun={itemNoun}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            overflowActions={overflowActions}
          />
          <div ref={bodyRef} className="px-4 py-4">
            {children}
          </div>
        </>
      ) : (
        <MasterDetailEditorEmptyState itemNoun={itemNoun} />
      )}
    </div>
  )
}
