import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { FormItems, type FormItem } from '@rpg/ui/form'

import { AvailabilityAlert, type Availability } from '@/lib/availability'
import { wrapMasterDetailDetailFields } from '../../lib/master-detail/wrap-master-detail-detail-fields'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import type { UseMasterDetailArrayResult } from '../../lib/master-detail/use-master-detail-array'
import { MasterDetailRowPrefixProvider } from '../../lib/master-detail/master-detail-row-prefix.context'
import type { DetailOverflowMenuEntry } from '../../lib/detail/detail-overflow-actions'
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
  /** Singular noun vocabulary for delete overflow copy and empty-selection messaging. */
  itemNoun: MasterDetailItemNounTerm
  /** When false, renders the shared empty detail state even if the editor has a selection. */
  showSelectedDetail?: boolean
  selectedIdentity?: MasterDetailEditorIdentity
  campaignId?: string
  rowAvailability?: Availability
  /** Availability-only dialog fields — rendered sr-only beside the row form. */
  availabilityFormItems?: FormItem[]
  /** Override RHF prefix for availability dialog fields (defaults to row prefix). */
  availabilityNamePrefix?: string
  availabilityDialogRef?: RefObject<HTMLDivElement | null>
  /** Leading overflow entries, such as Move to. */
  overflowActions?: readonly DetailOverflowMenuEntry[]
  /** Attack summary, notices, and advisories rendered above the row fields. */
  detailLeading?: ReactNode
  /** Replaces the default `FormItems` body when the row is not a static field list. */
  renderBody?: (ctx: {
    selectedFieldId: string
    selectedIndex: number
    namePrefix: string
  }) => ReactNode
  onDuplicate?: () => void
  /** Replaces the default delete-confirm request. */
  onDelete?: () => void
}

interface MasterDetailSelectedRowEditorProps {
  itemFields: FormItem[]
  fieldName: string
  idPrefix: string
  selectedFieldId: string
  selectedIndex: number
  campaignId?: string
  rowAvailability?: Availability
  availabilityFormItems?: FormItem[]
  availabilityNamePrefix?: string
  availabilityDialogRef?: RefObject<HTMLDivElement | null>
  detailLeading?: ReactNode
  renderBody?: (ctx: {
    selectedFieldId: string
    selectedIndex: number
    namePrefix: string
  }) => ReactNode
}

function MasterDetailSelectedRowEditor({
  itemFields,
  fieldName,
  idPrefix,
  selectedFieldId,
  selectedIndex,
  campaignId,
  rowAvailability,
  availabilityFormItems,
  availabilityNamePrefix,
  availabilityDialogRef,
  detailLeading,
  renderBody,
}: MasterDetailSelectedRowEditorProps) {
  const resolvedAvailabilityNamePrefix = availabilityNamePrefix ?? `${fieldName}.${selectedIndex}`

  const rowPrefix = `${fieldName}.${selectedIndex}`

  return (
    <MasterDetailRowPrefixProvider value={rowPrefix}>
      {rowAvailability?.status === 'inactive' && campaignId ? (
        <AvailabilityAlert availability={rowAvailability} context={{ campaignId }} />
      ) : null}
      {availabilityFormItems ? (
        <div ref={availabilityDialogRef} className="sr-only" aria-hidden={false}>
          <FormItems
            items={availabilityFormItems}
            idPrefix={`${idPrefix}-${selectedFieldId}-availability`}
            namePrefix={resolvedAvailabilityNamePrefix}
          />
        </div>
      ) : null}
      {detailLeading}
      {renderBody ? (
        renderBody({ selectedFieldId, selectedIndex, namePrefix: rowPrefix })
      ) : (
        <FormItems
          key={`${selectedFieldId}:${selectedIndex}`}
          items={wrapMasterDetailDetailFields(itemFields)}
          idPrefix={`${idPrefix}-${selectedFieldId}`}
          namePrefix={rowPrefix}
        />
      )}
    </MasterDetailRowPrefixProvider>
  )
}

/**
 * Detail column for a form-embedded master-detail editor: one bordered surface
 * with compact identity, overflow delete, and selected row form.
 */
export function MasterDetailEditorPanel({
  editor,
  itemFields,
  fieldName,
  idPrefix,
  itemNoun,
  showSelectedDetail = true,
  selectedIdentity,
  campaignId,
  rowAvailability,
  availabilityFormItems,
  availabilityNamePrefix,
  availabilityDialogRef,
  overflowActions,
  detailLeading,
  renderBody,
  onDuplicate,
  onDelete,
}: MasterDetailEditorPanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const selectedIndex = editor.selectedIndex
  const selectedFieldId = editor.selectedFieldId
  const hasSelectedRow = showSelectedDetail && selectedIndex !== null && Boolean(selectedFieldId)

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
      onDelete={
        onDelete ??
        (() => {
          if (selectedIndex !== null) editor.requestRemove(selectedIndex)
        })
      }
      onDuplicate={onDuplicate}
      overflowActions={overflowActions}
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
          availabilityFormItems={availabilityFormItems}
          availabilityNamePrefix={availabilityNamePrefix}
          availabilityDialogRef={availabilityDialogRef}
          detailLeading={detailLeading}
          renderBody={renderBody}
        />
      ) : null}
    </MasterDetailEditorShell>
  )
}
