'use client'

import { Text } from '@rpg/ui'
import { FormItems, type FormItem } from '@rpg/ui/form'

import { AvailabilityAlert, type Availability } from '@/lib/availability'
import type { UseMasterDetailArrayResult } from '../../lib/master-detail/use-master-detail-array'
import { resolveMasterDetailRowKey } from '../../lib/master-detail/content-campaign-availability'
import { MasterDetailActiveToggle } from './master-detail-active-toggle.client'
import { MasterDetailValidationBanner } from './master-detail-validation-banner.client'

export interface MasterDetailEditorPanelProps {
  editor: UseMasterDetailArrayResult
  itemFields: FormItem[]
  /** Parent form field path, e.g. `traits` or `heritage.options`. */
  fieldName: string
  /** Prefix for detail `FormItems` ids, e.g. `species-trait`. */
  idPrefix: string
  showValidationBanner: boolean
  emptySelectionLabel: string
  /** When true (default), renders the campaign availability toggle above the form. */
  showActiveToggle?: boolean
  /** Selected row values used to resolve the stable row key for the toggle. */
  selectedRow?: { id?: string }
  campaignId?: string
  rowAvailability?: Availability
}

interface MasterDetailSelectedRowEditorProps {
  editor: UseMasterDetailArrayResult
  itemFields: FormItem[]
  fieldName: string
  idPrefix: string
  selectedFieldId: string
  selectedIndex: number
  showActiveToggle: boolean
  rowKey?: string
  selectedRow?: { id?: string }
  campaignId?: string
  rowAvailability?: Availability
}

function MasterDetailSelectedRowEditor({
  editor,
  itemFields,
  fieldName,
  idPrefix,
  selectedFieldId,
  selectedIndex,
  showActiveToggle,
  rowKey,
  selectedRow,
  campaignId,
  rowAvailability,
}: MasterDetailSelectedRowEditorProps) {
  return (
    <>
      {showActiveToggle && rowKey ? (
        <MasterDetailActiveToggle
          controlId={`${idPrefix}-${selectedFieldId}-active`}
          activeInCampaign={editor.isRowActive(selectedIndex, selectedRow)}
          onActiveChange={(active) => editor.setRowActive(rowKey, active)}
        />
      ) : null}
      {rowAvailability?.status === 'inactive' && campaignId ? (
        <AvailabilityAlert availability={rowAvailability} context={{ campaignId }} />
      ) : null}
      <FormItems
        key={selectedFieldId}
        items={itemFields}
        idPrefix={`${idPrefix}-${selectedFieldId}`}
        namePrefix={`${fieldName}.${selectedIndex}`}
      />
    </>
  )
}

function MasterDetailEmptySelectionHint({ visible, label }: { visible: boolean; label: string }) {
  if (!visible) return null

  return (
    <Text variant="muted" className="text-sm">
      {label}
    </Text>
  )
}

/**
 * Detail column for a form-embedded master-detail editor: validation banner,
 * optional active toggle, selected row form, or empty-selection hint.
 */
export function MasterDetailEditorPanel({
  editor,
  itemFields,
  fieldName,
  idPrefix,
  showValidationBanner,
  emptySelectionLabel,
  showActiveToggle = true,
  selectedRow,
  campaignId,
  rowAvailability,
}: MasterDetailEditorPanelProps) {
  const selectedIndex = editor.selectedIndex
  const selectedFieldId = selectedIndex !== null ? editor.fields[selectedIndex]?.id : undefined
  const rowKey =
    selectedFieldId !== undefined
      ? resolveMasterDetailRowKey(selectedFieldId, selectedRow)
      : undefined
  const hasSelectedRow = selectedIndex !== null && Boolean(selectedFieldId)

  return (
    <div className="space-y-3 md:col-span-2">
      <MasterDetailValidationBanner visible={showValidationBanner} />
      {hasSelectedRow && selectedFieldId ? (
        <MasterDetailSelectedRowEditor
          editor={editor}
          itemFields={itemFields}
          fieldName={fieldName}
          idPrefix={idPrefix}
          selectedFieldId={selectedFieldId}
          selectedIndex={selectedIndex}
          showActiveToggle={showActiveToggle}
          rowKey={rowKey}
          selectedRow={selectedRow}
          campaignId={campaignId}
          rowAvailability={rowAvailability}
        />
      ) : (
        <MasterDetailEmptySelectionHint
          visible={!showValidationBanner}
          label={emptySelectionLabel}
        />
      )}
    </div>
  )
}
