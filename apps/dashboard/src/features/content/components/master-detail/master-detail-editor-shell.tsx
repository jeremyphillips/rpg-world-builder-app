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
import { MasterDetailAvailabilityHeaderLine } from './master-detail-availability-header-line'
import { MasterDetailEditorEmptyState } from './master-detail-editor-empty-state'
import {
  masterDetailEditorBodyClasses,
  masterDetailEditorEmptyShellClasses,
  masterDetailEditorIdentityClasses,
  masterDetailEditorAvailabilityClasses,
  masterDetailEditorIdentityCopyClasses,
  masterDetailEditorMetaClasses,
  masterDetailEditorShellClassName,
  masterDetailEditorTitleClasses,
  masterDetailEditorValidationBannerClasses,
} from './master-detail-editor-panel.variants'
import { MasterDetailValidationBanner } from './master-detail-validation-banner'

export interface MasterDetailEditorIdentity {
  title: string
  meta?: MasterDetailItemMeta
  deletable?: boolean
  availability?: MasterDetailAvailabilityPresentation
  onAvailabilityChange?: () => void
}

export interface MasterDetailEditorShellProps {
  itemNoun: MasterDetailItemNounTerm
  selectedIdentity?: MasterDetailEditorIdentity
  onDelete?: () => void
  showValidationBanner?: boolean
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
        {identity.availability && identity.onAvailabilityChange ? (
          <div className={masterDetailEditorAvailabilityClasses}>
            <MasterDetailAvailabilityHeaderLine
              availability={identity.availability}
              onAvailabilityChange={identity.onAvailabilityChange}
            />
          </div>
        ) : null}
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
 * Bordered detail rail shell: validation banner, identity header with overflow
 * delete, and a body slot. Renders the shared empty state when nothing is selected.
 */
export function MasterDetailEditorShell({
  itemNoun,
  selectedIdentity,
  onDelete,
  showValidationBanner = false,
  bodyRef,
  children,
}: MasterDetailEditorShellProps) {
  const hasSelectedRow = Boolean(selectedIdentity)
  const useEmptyShell = !hasSelectedRow && !showValidationBanner

  return (
    <div
      className={
        useEmptyShell ? masterDetailEditorEmptyShellClasses : masterDetailEditorShellClassName()
      }
    >
      {showValidationBanner ? (
        <div className={masterDetailEditorValidationBannerClasses}>
          <MasterDetailValidationBanner visible />
        </div>
      ) : null}

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
      ) : useEmptyShell ? (
        <MasterDetailEditorEmptyState itemNoun={itemNoun} />
      ) : null}
    </div>
  )
}
