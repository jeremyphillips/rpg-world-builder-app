import type { ReactNode, RefObject } from 'react'
import { useFormContext } from 'react-hook-form'
import { cn, panelVariants } from '@rpg/ui'

import { DetailOverflowMenu } from '../../lib/detail/detail-overflow-menu'
import {
  detailOverflowAvailabilityAction,
  detailOverflowDeleteAction,
  detailOverflowDuplicateAction,
  type DetailOverflowMenuEntry,
} from '../../lib/detail/detail-overflow-actions'
import {
  joinMasterDetailCaption,
  type MasterDetailItemMeta,
} from '../../lib/master-detail/master-detail-item-meta'
import { masterDetailItemNounLabel } from '../../lib/master-detail/master-detail-constants'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import type { MasterDetailAvailabilityPresentation } from '../../lib/master-detail/master-detail-availability.types'
import { MasterDetailEditorEmptyState } from './master-detail-editor-empty-state'
import { MasterDetailEditorStatusRow } from './master-detail-editor-status-row'
import {
  MasterDetailInlineTitleEditor,
  type MasterDetailInlineTitle,
} from './master-detail-inline-title'

export type { MasterDetailInlineTitle }

export interface MasterDetailEditorIdentity {
  title: string
  /** Stable selected row id. Remounts the title editor when the selection changes. */
  rowKey?: string
  meta?: MasterDetailItemMeta
  /** Derived original name, shown in the detail caption while a custom name is stored. */
  sourceName?: string
  deletable?: boolean
  availability?: MasterDetailAvailabilityPresentation
  onAvailabilityChange?: () => void
  /** Distinct claim-target issue count for the selected row. */
  issueCount?: number
  /** Issues claimed by the row itself, shown beside the count. */
  headerIssues?: readonly { path: string; message: string }[]
  inlineTitle?: MasterDetailInlineTitle
}

export interface MasterDetailEditorShellProps {
  itemNoun: MasterDetailItemNounTerm
  selectedIdentity?: MasterDetailEditorIdentity
  /** RHF prefix for the selected row, required when `inlineTitle` is set. */
  namePrefix?: string
  onDelete?: () => void
  /** Copies the selected row as a new homebrew row. */
  onDuplicate?: () => void
  /** Extra overflow entries, rendered after availability and duplicate. */
  overflowActions?: readonly DetailOverflowMenuEntry[]
  bodyRef?: RefObject<HTMLDivElement | null>
  children?: ReactNode
}

function MasterDetailEditorIdentityChrome({
  identity,
  itemNoun,
  onDelete,
  onDuplicate,
  overflowActions,
  resetAction,
  title,
}: {
  identity: MasterDetailEditorIdentity
  itemNoun: MasterDetailItemNounTerm
  onDelete?: () => void
  onDuplicate?: () => void
  overflowActions?: readonly DetailOverflowMenuEntry[]
  resetAction?: DetailOverflowMenuEntry
  title: ReactNode
}) {
  const metaLine = identity.meta
    ? joinMasterDetailCaption(identity.meta, 'detail', identity.sourceName)
    : undefined
  const deletable = identity.deletable !== false && Boolean(onDelete)
  const itemNounLabel = masterDetailItemNounLabel(itemNoun)
  const leadingActions: DetailOverflowMenuEntry[] = [
    ...(resetAction ? [resetAction] : []),
    ...(identity.onAvailabilityChange
      ? [detailOverflowAvailabilityAction(identity.onAvailabilityChange)]
      : []),
    ...(onDuplicate
      ? [detailOverflowDuplicateAction(`Duplicate ${itemNounLabel}`, onDuplicate)]
      : []),
    ...(overflowActions ?? []),
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
      <div className="min-w-0 flex-1 space-y-0.5">
        {title}
        {metaLine ? <div className="truncate text-style-caption">{metaLine}</div> : null}
        <MasterDetailEditorStatusRow
          availability={identity.availability}
          onAvailabilityChange={identity.onAvailabilityChange}
          issueCount={identity.issueCount}
          headerIssues={identity.headerIssues}
        />
      </div>
      {menuActions.length > 0 ? (
        <DetailOverflowMenu triggerLabel={`Actions for ${identity.title}`} actions={menuActions} />
      ) : null}
    </div>
  )
}

function MasterDetailEditableIdentityHeader({
  identity,
  namePrefix,
  inlineTitle,
  itemNoun,
  onDelete,
  onDuplicate,
  overflowActions,
}: {
  identity: MasterDetailEditorIdentity
  namePrefix: string
  inlineTitle: MasterDetailInlineTitle
  itemNoun: MasterDetailItemNounTerm
  onDelete?: () => void
  onDuplicate?: () => void
  overflowActions?: readonly DetailOverflowMenuEntry[]
}) {
  const { getValues, setValue } = useFormContext()
  const resetAction = inlineTitle.resetLabel
    ? {
        id: 'use-default-name',
        label: inlineTitle.resetLabel,
        onSelect: () => {
          const path = `${namePrefix}.${inlineTitle.field}`
          const parentPath = path.slice(0, path.lastIndexOf('.'))
          const parent = getValues(parentPath)
          if (parent && typeof parent === 'object' && !Array.isArray(parent)) {
            const copy = { ...(parent as Record<string, unknown>) }
            delete copy[inlineTitle.field]
            setValue(parentPath, copy, {
              shouldDirty: true,
              shouldTouch: true,
              shouldValidate: true,
            })
            return
          }
          setValue(path, undefined, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        },
      }
    : undefined

  return (
    <MasterDetailEditorIdentityChrome
      identity={identity}
      itemNoun={itemNoun}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      overflowActions={overflowActions}
      resetAction={resetAction}
      title={
        <MasterDetailInlineTitleEditor
          key={identity.rowKey ?? namePrefix}
          namePrefix={namePrefix}
          rowKey={identity.rowKey ?? namePrefix}
          title={inlineTitle}
        />
      }
    />
  )
}

function MasterDetailEditorIdentityHeader({
  identity,
  namePrefix,
  itemNoun,
  onDelete,
  onDuplicate,
  overflowActions,
}: {
  identity: MasterDetailEditorIdentity
  namePrefix?: string
  itemNoun: MasterDetailItemNounTerm
  onDelete?: () => void
  onDuplicate?: () => void
  overflowActions?: readonly DetailOverflowMenuEntry[]
}) {
  if (identity.inlineTitle && namePrefix) {
    return (
      <MasterDetailEditableIdentityHeader
        identity={identity}
        namePrefix={namePrefix}
        inlineTitle={identity.inlineTitle}
        itemNoun={itemNoun}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        overflowActions={overflowActions}
      />
    )
  }

  return (
    <MasterDetailEditorIdentityChrome
      identity={identity}
      itemNoun={itemNoun}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      overflowActions={overflowActions}
      title={<div className="truncate text-lg font-medium text-foreground">{identity.title}</div>}
    />
  )
}

/**
 * Bordered detail rail shell: identity header with overflow delete, and a body slot.
 * Renders the shared empty state when nothing is selected.
 */
export function MasterDetailEditorShell({
  itemNoun,
  selectedIdentity,
  namePrefix,
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
            namePrefix={namePrefix}
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
