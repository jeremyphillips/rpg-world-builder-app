import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { FormItems, type FormItem } from '@rpg/ui/form'

import { AvailabilityAlert, type Availability } from '@/lib/availability'
import type { FacingHostConfig } from '../../facing/facing-host-config.types'
import type { MasterDetailItemNounTerm } from '../../lib/master-detail/master-detail-item-noun'
import type { UseMasterDetailArrayResult } from '../../lib/master-detail/use-master-detail-array'
import { MasterDetailRowPrefixProvider } from '../../lib/master-detail/master-detail-row-prefix.context'
import type { DetailOverflowMenuEntry } from '../../lib/detail/detail-overflow-actions'
import {
  MasterDetailEditorShell,
  type MasterDetailEditorIdentity,
  type MasterDetailInlineTitle,
} from './master-detail-editor-shell'
import {
  MasterDetailDetailBody,
  type MasterDetailItemFieldSections,
} from './master-detail-detail-body'

export type { MasterDetailEditorIdentity, MasterDetailInlineTitle }

/** Visible detail controls. Skips Radix bubble inputs (`aria-hidden`, `tabindex="-1"`). */
const MASTER_DETAIL_BODY_FOCUS_SELECTOR = [
  'input:not([type="hidden"]):not([aria-hidden="true"]):not([tabindex="-1"])',
  'select:not([aria-hidden="true"]):not([tabindex="-1"])',
  'textarea:not([aria-hidden="true"]):not([tabindex="-1"])',
  '[contenteditable="true"]:not([aria-hidden="true"])',
].join(', ')

function focusIsInInlineTitle(): boolean {
  const active = document.activeElement
  return active instanceof Element && Boolean(active.closest('[data-master-detail-title-row]'))
}

function omitInlineTitleField(fields: FormItem[], fieldName: string | undefined): FormItem[] {
  if (!fieldName) return fields
  return fields.filter((item) => !('name' in item) || item.name !== fieldName)
}

export interface MasterDetailEditorPanelProps {
  editor: UseMasterDetailArrayResult
  itemFields: FormItem[]
  /** Parent RHF field-array path, e.g. `traits` or `legendaryActions.actions` (not a section id). */
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
  /** Extra overflow entries, such as Move to, rendered after availability and duplicate. */
  overflowActions?: readonly DetailOverflowMenuEntry[]
  /**
   * Notices, advisories, and focus anchors rendered outside the detail-body rhythm stack.
   * Do not mount facing previews or ordinary form fields here.
   */
  contextualChrome?: ReactNode
  /** @deprecated Use `contextualChrome`. */
  detailLeading?: ReactNode
  /** Shell-owned player-facing preview for the selected structured row. */
  facing?: FacingHostConfig
  /** Optional leading vs primary field regions (`leading` → facing → `primary`). */
  fieldSections?: MasterDetailItemFieldSections
  /** Domain composites after primary fields inside the outer rhythm stack. */
  additionalDetails?: ReactNode
  /**
   * Wraps primary `FormItems` when a domain host must own interactive context (spell picker).
   * Must not introduce a second outer rhythm stack.
   */
  renderPrimary?: (ctx: { namePrefix: string }) => ReactNode
  /**
   * Escape hatch for tests and transitional shells. Do not compose facing or outer rhythm here.
   * @deprecated Prefer `facing`, `fieldSections`, and `renderPrimary`.
   */
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
  contextualChrome?: ReactNode
  facing?: FacingHostConfig
  fieldSections?: MasterDetailItemFieldSections
  additionalDetails?: ReactNode
  renderPrimary?: (ctx: { namePrefix: string }) => ReactNode
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
  contextualChrome,
  facing,
  fieldSections,
  additionalDetails,
  renderPrimary,
  renderBody,
}: MasterDetailSelectedRowEditorProps) {
  const resolvedAvailabilityNamePrefix = availabilityNamePrefix ?? `${fieldName}.${selectedIndex}`

  const rowPrefix = `${fieldName}.${selectedIndex}`

  const leadingItemFields = fieldSections?.leading ?? []
  const primaryItemFields = fieldSections?.primary ?? itemFields

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
      {contextualChrome}
      {renderBody ? (
        renderBody({ selectedFieldId, selectedIndex, namePrefix: rowPrefix })
      ) : (
        <MasterDetailDetailBody
          leadingItemFields={leadingItemFields}
          primaryItemFields={primaryItemFields}
          facing={facing}
          idPrefix={idPrefix}
          selectedFieldId={selectedFieldId}
          namePrefix={rowPrefix}
          additionalDetails={additionalDetails}
          renderPrimary={renderPrimary}
        />
      )}
    </MasterDetailRowPrefixProvider>
  )
}

/**
 * Detail column for a form-embedded master-detail editor: one bordered surface
 * with compact identity, overflow delete, and selected row form.
 */
// fallow-ignore-next-line complexity
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
  contextualChrome,
  detailLeading,
  facing,
  fieldSections,
  additionalDetails,
  renderPrimary,
  renderBody,
  onDuplicate,
  onDelete,
}: MasterDetailEditorPanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const selectedIndex = editor.selectedIndex
  const selectedFieldId = editor.selectedFieldId
  const hasSelectedRow = showSelectedDetail && selectedIndex !== null && Boolean(selectedFieldId)

  const inlineTitle = hasSelectedRow ? selectedIdentity?.inlineTitle : undefined

  const lastAddedFieldId = editor.lastAddedFieldId
  const acknowledgeAcquisition = editor.acknowledgeAcquisition
  const awaitingTitle = Boolean(selectedIdentity?.acquisitionAwaitingTitleResolution)

  const handleAcquisitionEditApplied = useCallback(
    (fieldId: string) => {
      acknowledgeAcquisition(fieldId)
    },
    [acknowledgeAcquisition],
  )

  useEffect(() => {
    if (!lastAddedFieldId || lastAddedFieldId !== selectedFieldId) return
    if (awaitingTitle) return
    const root = bodyRef.current
    if (!root) {
      acknowledgeAcquisition(selectedFieldId)
      return
    }
    if (focusIsInInlineTitle()) {
      acknowledgeAcquisition(selectedFieldId)
      return
    }
    const focusable = root.querySelector<HTMLElement>(MASTER_DETAIL_BODY_FOCUS_SELECTOR)
    focusable?.focus()
    acknowledgeAcquisition(selectedFieldId)
  }, [acknowledgeAcquisition, awaitingTitle, lastAddedFieldId, selectedFieldId])

  const visibleFields = omitInlineTitleField(itemFields, inlineTitle?.field)

  const resolvedContextualChrome = contextualChrome ?? detailLeading

  return (
    <MasterDetailEditorShell
      itemNoun={itemNoun}
      namePrefix={
        hasSelectedRow && selectedIndex !== null ? `${fieldName}.${selectedIndex}` : undefined
      }
      selectedFieldId={hasSelectedRow ? selectedFieldId : undefined}
      onAcquisitionEditApplied={handleAcquisitionEditApplied}
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
          itemFields={visibleFields}
          fieldName={fieldName}
          idPrefix={idPrefix}
          selectedFieldId={selectedFieldId}
          selectedIndex={selectedIndex}
          campaignId={campaignId}
          rowAvailability={rowAvailability}
          availabilityFormItems={availabilityFormItems}
          availabilityNamePrefix={availabilityNamePrefix}
          availabilityDialogRef={availabilityDialogRef}
          contextualChrome={resolvedContextualChrome}
          facing={facing}
          fieldSections={fieldSections}
          additionalDetails={additionalDetails}
          renderPrimary={renderPrimary}
          renderBody={renderBody}
        />
      ) : null}
    </MasterDetailEditorShell>
  )
}
