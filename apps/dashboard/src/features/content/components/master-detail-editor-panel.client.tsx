'use client'

import { Text } from '@rpg/ui'
import { FormItems, type FormItem } from '@rpg/ui/form'

import type { UseMasterDetailArrayResult } from '../lib/use-master-detail-array'
import { resolveMasterDetailRowKey } from '../lib/content-campaign-availability'
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
}: MasterDetailEditorPanelProps) {
  const selectedFieldId =
    editor.selectedIndex !== null ? editor.fields[editor.selectedIndex]?.id : undefined
  const rowKey =
    selectedFieldId !== undefined
      ? resolveMasterDetailRowKey(selectedFieldId, selectedRow)
      : undefined

  return (
    <div className="space-y-3 md:col-span-2">
      <MasterDetailValidationBanner visible={showValidationBanner} />
      {editor.selectedIndex !== null && selectedFieldId ? (
        <>
          {showActiveToggle && rowKey ? (
            <MasterDetailActiveToggle
              controlId={`${idPrefix}-${selectedFieldId}-active`}
              activeInCampaign={editor.isRowActive(editor.selectedIndex, selectedRow)}
              onActiveChange={(active) => editor.setRowActive(rowKey, active)}
            />
          ) : null}
          <FormItems
            key={selectedFieldId}
            items={itemFields}
            idPrefix={`${idPrefix}-${selectedFieldId}`}
            namePrefix={`${fieldName}.${editor.selectedIndex}`}
            plainSections
          />
        </>
      ) : !showValidationBanner ? (
        <Text variant="muted" className="text-sm">
          {emptySelectionLabel}
        </Text>
      ) : null}
    </div>
  )
}
