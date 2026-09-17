'use client'

import { useController, useFormState } from 'react-hook-form'

import { SwitchField } from '../../components/ui/switch-field'
import { pickFieldChromeProps } from '../../components/ui/field-chrome.variants'
import { useFieldControlSize } from '../context/form-section.context'
import { resolveNestedFieldErrorMessage } from '../errors/resolve-field-error-message'
import {
  resolveFieldHintPresentation,
  type DependentConfig,
  type SwitchFieldConfig,
} from '../field-config'
import { collectDependentClearingFields } from '../config/confirm-before-clear.lib'
import { useConfirmBeforeClear } from '../config/use-confirm-before-clear.client'
import { buildFieldControlId } from './form-conditional.client'

interface DependentSwitchControllerProps {
  item: DependentConfig
  controller: SwitchFieldConfig
  idPrefix: string
  namePrefix?: string
}

/** Switch controller for dependent sections with optional confirm-before-clear. */
export function DependentSwitchController({
  item,
  controller,
  idPrefix,
  namePrefix,
}: DependentSwitchControllerProps) {
  const fullName = namePrefix ? `${namePrefix}.${controller.name}` : controller.name
  const id = buildFieldControlId(idPrefix, namePrefix, controller.name)
  const controlSize = useFieldControlSize(controller.controlSizeOverride)
  const hintPresentation = resolveFieldHintPresentation(controller, {})
  const { field, fieldState } = useController({
    name: fullName,
    defaultValue: controller.defaultValue ?? false,
  })
  const { errors } = useFormState()
  const errorMessage = fieldState.error?.message ?? resolveNestedFieldErrorMessage(errors, fullName)
  const clearingFields = collectDependentClearingFields(item.dependents.fields)

  const { attemptClear, confirmDialog } = useConfirmBeforeClear({
    confirmBeforeClear: item.confirmBeforeClear,
    clearingFields,
    namePrefix,
    onClear: () => field.onChange(false),
  })

  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
      field.onChange(true)
      return
    }

    if (item.confirmBeforeClear) {
      attemptClear()
      return
    }

    field.onChange(false)
  }

  return (
    <>
      <SwitchField
        id={id}
        {...pickFieldChromeProps(controller)}
        label={controller.label}
        labelVisibility={controller.labelVisibility}
        labelPosition={controller.labelPosition}
        error={errorMessage}
        invalid={Boolean(errorMessage)}
        hint={hintPresentation.text}
        hintPosition={hintPresentation.position}
        info={controller.info}
        required={controller.required}
        width={controller.width}
        size={controlSize}
        disabled={controller.disabled}
        checked={field.value ?? false}
        onCheckedChange={handleCheckedChange}
        onBlur={field.onBlur}
      />
      {confirmDialog}
    </>
  )
}
