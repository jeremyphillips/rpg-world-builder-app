import { Text } from '@rpg/ui'
import { FormItems, type FormItem } from '@rpg/ui/form'

import { AvailabilityAlert, type Availability } from '@/lib/availability'
import type { UseMasterDetailArrayResult } from '../../lib/master-detail/use-master-detail-array'
import { MasterDetailValidationBanner } from './master-detail-validation-banner'

export interface MasterDetailEditorPanelProps {
  editor: UseMasterDetailArrayResult
  itemFields: FormItem[]
  /** Parent form field path, e.g. `traits` or `heritage.options`. */
  fieldName: string
  /** Prefix for detail `FormItems` ids, e.g. `species-trait`. */
  idPrefix: string
  showValidationBanner: boolean
  emptySelectionLabel: string
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
 * selected row form, or empty-selection hint.
 */
export function MasterDetailEditorPanel({
  editor,
  itemFields,
  fieldName,
  idPrefix,
  showValidationBanner,
  emptySelectionLabel,
  campaignId,
  rowAvailability,
}: MasterDetailEditorPanelProps) {
  const selectedIndex = editor.selectedIndex
  const selectedFieldId = selectedIndex !== null ? editor.fields[selectedIndex]?.id : undefined
  const hasSelectedRow = selectedIndex !== null && Boolean(selectedFieldId)

  return (
    <div className="space-y-3 md:col-span-2">
      <MasterDetailValidationBanner visible={showValidationBanner} />
      {hasSelectedRow && selectedFieldId ? (
        <MasterDetailSelectedRowEditor
          itemFields={itemFields}
          fieldName={fieldName}
          idPrefix={idPrefix}
          selectedFieldId={selectedFieldId}
          selectedIndex={selectedIndex}
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
