import { useEffect, useRef } from 'react'
import { FormItems, type FormItem } from '@rpg/ui/form'

import { AvailabilityAlert, type Availability } from '@/lib/availability'
import { wrapMasterDetailDetailFields } from '../../lib/master-detail/wrap-master-detail-detail-fields'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import type { UseMasterDetailArrayResult } from '../../lib/master-detail/use-master-detail-array'
import {
  MasterDetailEditorShell,
  type MasterDetailEditorIdentity,
} from './master-detail-editor-shell'

export type { MasterDetailEditorIdentity }

export interface MasterDetailEditorPanelProps {
  editor: UseMasterDetailArrayResult
  itemFields: FormItem[]
  /** Parent form field path, e.g. `traits` or `heritage.options`. */
  fieldName: string
  /** Prefix for detail `FormItems` ids, e.g. `species-trait`. */
  idPrefix: string
  showValidationBanner: boolean
  /** Singular noun vocabulary for delete overflow copy and empty-selection messaging. */
  itemNoun: MasterDetailItemNounTerm
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
    <MasterDetailEditorShell
      itemNoun={itemNoun}
      selectedIdentity={hasSelectedRow ? selectedIdentity : undefined}
      onDelete={() => {
        if (selectedIndex !== null) editor.requestRemove(selectedIndex)
      }}
      showValidationBanner={showValidationBanner}
      bodyRef={bodyRef}
    >
      {hasSelectedRow && selectedFieldId && selectedIndex !== null ? (
        <MasterDetailSelectedRowEditor
          itemFields={itemFields}
          fieldName={fieldName}
          idPrefix={idPrefix}
          selectedFieldId={selectedFieldId}
          selectedIndex={selectedIndex}
          campaignId={campaignId}
          rowAvailability={rowAvailability}
        />
      ) : null}
    </MasterDetailEditorShell>
  )
}
