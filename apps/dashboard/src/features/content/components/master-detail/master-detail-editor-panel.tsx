import { useEffect, useRef } from 'react'
import { Text } from '@rpg/ui'
import { FormItems, type FormItem } from '@rpg/ui/form'

import { AvailabilityAlert, type Availability } from '@/lib/availability'
import {
  DetailOverflowMenu,
  detailOverflowDeleteAction,
} from '../../lib/detail/detail-overflow-menu'
import { wrapMasterDetailDetailFields } from '../../lib/master-detail/wrap-master-detail-detail-fields'
import {
  joinMasterDetailItemMeta,
  type MasterDetailItemMeta,
} from '../../lib/master-detail/master-detail-item-meta'
import type { UseMasterDetailArrayResult } from '../../lib/master-detail/use-master-detail-array'
import {
  masterDetailEditorBodyClasses,
  masterDetailEditorEmptyClasses,
  masterDetailEditorIdentityClasses,
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
}

export interface MasterDetailEditorPanelProps {
  editor: UseMasterDetailArrayResult
  itemFields: FormItem[]
  /** Parent form field path, e.g. `traits` or `heritage.options`. */
  fieldName: string
  /** Prefix for detail `FormItems` ids, e.g. `species-trait`. */
  idPrefix: string
  showValidationBanner: boolean
  emptySelectionLabel: string
  /** Singular noun for delete overflow copy, e.g. `trait`. */
  itemNoun: string
  selectedIdentity?: MasterDetailEditorIdentity
  campaignId?: string
  rowAvailability?: Availability
}

interface MasterDetailSelectedRowEditorProps {
  itemFields: FormItem[]
  fieldName: string
  idPrefix: string
  selectedFieldId: string
  selectedIndex: number
  campaignId?: string
  rowAvailability?: Availability
}

function MasterDetailSelectedRowEditor({
  itemFields,
  fieldName,
  idPrefix,
  selectedFieldId,
  selectedIndex,
  campaignId,
  rowAvailability,
}: MasterDetailSelectedRowEditorProps) {
  return (
    <>
      {rowAvailability?.status === 'inactive' && campaignId ? (
        <AvailabilityAlert availability={rowAvailability} context={{ campaignId }} />
      ) : null}
      <FormItems
        key={selectedFieldId}
        items={wrapMasterDetailDetailFields(itemFields)}
        idPrefix={`${idPrefix}-${selectedFieldId}`}
        namePrefix={`${fieldName}.${selectedIndex}`}
      />
    </>
  )
}

function MasterDetailEditorIdentityHeader({
  identity,
  itemNoun,
  onDelete,
}: {
  identity: MasterDetailEditorIdentity
  itemNoun: string
  onDelete: () => void
}) {
  const metaLine = identity.meta ? joinMasterDetailItemMeta(identity.meta) : undefined
  const deletable = identity.deletable !== false

  return (
    <div className={masterDetailEditorIdentityClasses}>
      <div className={masterDetailEditorIdentityCopyClasses}>
        <div className={masterDetailEditorTitleClasses}>{identity.title}</div>
        {metaLine ? <div className={masterDetailEditorMetaClasses}>{metaLine}</div> : null}
      </div>
      {deletable ? (
        <DetailOverflowMenu
          triggerLabel={`Actions for ${identity.title}`}
          actions={[detailOverflowDeleteAction(`Delete ${itemNoun}`, onDelete)]}
        />
      ) : null}
    </div>
  )
}

/**
 * Detail column for a form-embedded master-detail editor: one bordered surface
 * with compact identity, overflow delete, validation banner, and selected row form.
 */
export function MasterDetailEditorPanel({
  editor,
  itemFields,
  fieldName,
  idPrefix,
  showValidationBanner,
  emptySelectionLabel,
  itemNoun,
  selectedIdentity,
  campaignId,
  rowAvailability,
}: MasterDetailEditorPanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const selectedIndex = editor.selectedIndex
  const selectedFieldId = editor.selectedFieldId
  const hasSelectedRow = selectedIndex !== null && Boolean(selectedFieldId)

  useEffect(() => {
    if (!editor.lastAddedFieldId || editor.lastAddedFieldId !== selectedFieldId) return
    const root = bodyRef.current
    if (!root) return
    const focusable = root.querySelector<HTMLElement>(
      'input:not([type="hidden"]), select, textarea, [contenteditable="true"]',
    )
    focusable?.focus()
    editor.clearLastAddedFieldId()
  }, [editor, selectedFieldId])

  return (
    <div className={masterDetailEditorShellClassName()}>
      {showValidationBanner ? (
        <div className={masterDetailEditorValidationBannerClasses}>
          <MasterDetailValidationBanner visible />
        </div>
      ) : null}

      {hasSelectedRow && selectedFieldId && selectedIdentity ? (
        <>
          <MasterDetailEditorIdentityHeader
            identity={selectedIdentity}
            itemNoun={itemNoun}
            onDelete={() => {
              if (selectedIndex !== null) editor.requestRemove(selectedIndex)
            }}
          />
          <div ref={bodyRef} className={masterDetailEditorBodyClasses}>
            <MasterDetailSelectedRowEditor
              itemFields={itemFields}
              fieldName={fieldName}
              idPrefix={idPrefix}
              selectedFieldId={selectedFieldId}
              selectedIndex={selectedIndex}
              campaignId={campaignId}
              rowAvailability={rowAvailability}
            />
          </div>
        </>
      ) : (
        <Text variant="muted" className={masterDetailEditorEmptyClasses}>
          {!showValidationBanner ? emptySelectionLabel : null}
        </Text>
      )}
    </div>
  )
}
