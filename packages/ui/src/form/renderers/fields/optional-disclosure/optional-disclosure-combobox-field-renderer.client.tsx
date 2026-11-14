'use client'

import { useState } from 'react'
import type { ControllerRenderProps } from 'react-hook-form'

import type { FieldHintPosition } from '../../../../components/ui/field.variants'
import type { FieldSize } from '../../../../components/ui/field.client'
import { OptionalFieldDisclosure } from '../../../../components/ui/optional-field-disclosure.client'
import type { ComboboxFieldConfig, OptionalDisclosureConfig } from '../../../field-config'
import type { FieldValidationProps } from '../../../../components/ui/field-validation-props'
import { useConfirmBeforeClear } from '../../../config/use-confirm-before-clear.client'
import { ComboboxFieldRenderer } from '../combobox/combobox-field-renderer.client'

function comboboxFieldHasValue(value: unknown, multiple: boolean | undefined): boolean {
  if (multiple) {
    return Array.isArray(value) && value.length > 0
  }
  return value != null && value !== ''
}

export type OptionalDisclosureComboboxFieldRendererProps = FieldValidationProps & {
  config: ComboboxFieldConfig
  disclosure: OptionalDisclosureConfig
  field: ControllerRenderProps
  id: string
  hint?: string
  hintPosition?: FieldHintPosition
  presentationSize: FieldSize
  controlSize: FieldSize
  namePrefix?: string
}

/** Optional-disclosure wrapper for schema-driven combobox fields. */
export function OptionalDisclosureComboboxFieldRenderer({
  config,
  disclosure,
  field,
  id,
  hint,
  hintPosition,
  presentationSize,
  controlSize,
  namePrefix,
  ...validation
}: OptionalDisclosureComboboxFieldRendererProps) {
  const [manualOpen, setManualOpen] = useState(false)
  const expandWhenPopulated = disclosure.expandWhenPopulated !== false
  const hasValue = comboboxFieldHasValue(field.value, config.multiple)
  const open = manualOpen || (expandWhenPopulated && hasValue)

  const clearValue = () => {
    field.onChange(config.multiple ? [] : '')
    setManualOpen(false)
  }
  const { attemptClear, confirmDialog } = useConfirmBeforeClear({
    confirmBeforeClear: disclosure.confirmBeforeClear,
    clearingFields: [config],
    onClear: clearValue,
  })

  return (
    <>
      <OptionalFieldDisclosure
        controlId={id}
        fieldLabel={config.label}
        addLabel={disclosure.addLabel}
        removeLabel={disclosure.removeLabel}
        open={open}
        labeled={disclosure.labeled}
        addDisabled={disclosure.addDisabled}
        onOpenChange={setManualOpen}
        onRemove={attemptClear}
        size={controlSize}
      >
        <ComboboxFieldRenderer
          config={{ ...config, labelVisibility: 'srOnly' }}
          presentationSize={presentationSize}
          controlSize={controlSize}
          field={field}
          id={id}
          hint={hint}
          hintPosition={hintPosition}
          namePrefix={namePrefix}
          {...validation}
        />
      </OptionalFieldDisclosure>
      {confirmDialog}
    </>
  )
}
