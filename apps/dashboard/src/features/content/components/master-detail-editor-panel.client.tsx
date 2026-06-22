'use client'

import { Text } from '@rpg/ui'
import { FormItems, type FormItem } from '@rpg/ui/form'

import type { UseMasterDetailArrayResult } from '../lib/use-master-detail-array'
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
}: MasterDetailEditorPanelProps) {
  const selectedFieldId =
    editor.selectedIndex !== null ? editor.fields[editor.selectedIndex]?.id : undefined

  return (
    <div className="space-y-3 md:col-span-2">
      <MasterDetailValidationBanner visible={showValidationBanner} />
      {editor.selectedIndex !== null && selectedFieldId ? (
        <FormItems
          key={selectedFieldId}
          items={itemFields}
          idPrefix={`${idPrefix}-${selectedFieldId}`}
          namePrefix={`${fieldName}.${editor.selectedIndex}`}
        />
      ) : !showValidationBanner ? (
        <Text variant="muted" className="text-sm">
          {emptySelectionLabel}
        </Text>
      ) : null}
    </div>
  )
}
