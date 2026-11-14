'use client'

import type { RefObject } from 'react'
import type { ControllerRenderProps } from 'react-hook-form'

import { Button } from '../../../../components/ui/button.client'
import { FieldReadOnlyValueField } from '../../../../components/ui/field-read-only-value.client'
import { SelectField } from '../../../../components/ui/select-field'
import type { FieldCopyContext } from '../../../config/field-copy-context.lib'
import { formMicroActionButtonProps } from '../../../form-micro-action'
import type { SelectFieldChromeProps } from './select-field-renderer.lib'
import type { useSelectFieldRendererState } from './use-select-field-renderer-state.client'

type SelectChrome = SelectFieldChromeProps
type SelectState = ReturnType<typeof useSelectFieldRendererState>

type SelectFieldReadOnlyViewProps = {
  chrome: SelectChrome
  displayValue: string
  validation: SelectState['validation']
}

export function SelectFieldReadOnlyView({
  chrome,
  displayValue,
  validation,
}: SelectFieldReadOnlyViewProps) {
  return <FieldReadOnlyValueField displayValue={displayValue} {...chrome} {...validation} />
}

type SelectFieldCommittedViewProps = {
  changeButtonRef: RefObject<HTMLButtonElement | null>
  changeLabel: string
  chrome: SelectChrome
  committedLabel: string | null
  displayValue: string
  disabled: boolean | undefined
  fieldLabel: string
  onBeginChange: () => void
  validation: SelectState['validation']
}

export function SelectFieldCommittedView({
  changeButtonRef,
  changeLabel,
  chrome,
  committedLabel,
  displayValue,
  disabled,
  fieldLabel,
  onBeginChange,
  validation,
}: SelectFieldCommittedViewProps) {
  return (
    <FieldReadOnlyValueField
      displayValue={committedLabel ?? displayValue}
      className="px-0"
      controlEnd={
        <Button
          {...formMicroActionButtonProps}
          ref={changeButtonRef}
          className="shrink-0 font-normal"
          disabled={disabled}
          aria-label={`${changeLabel} ${fieldLabel}`}
          onClick={onBeginChange}
        >
          {changeLabel}
        </Button>
      }
      {...chrome}
      {...validation}
    />
  )
}

type SelectFieldEditorViewProps = {
  chrome: SelectChrome
  copyContext: FieldCopyContext
  field: ControllerRenderProps
  onBlur: () => void
  onOpenChange: (open: boolean) => void
  onValueChange: (next: string) => void
  renderConfig: SelectState['renderConfig']
  resolvedOptions: SelectState['resolvedOptions']
  validation: SelectState['validation']
  value: string
}

export function SelectFieldEditorView({
  chrome,
  copyContext,
  field,
  onBlur,
  onOpenChange,
  onValueChange,
  renderConfig,
  resolvedOptions,
  validation,
  value,
}: SelectFieldEditorViewProps) {
  return (
    <SelectField
      options={resolvedOptions}
      placeholder={renderConfig.placeholder}
      noun={copyContext.noun}
      digits={renderConfig.digits}
      sizingLabel={renderConfig.sizingLabel}
      sizingLabels={renderConfig.sizingLabels}
      name={field.name}
      disabled={renderConfig.disabled}
      value={value}
      onValueChange={onValueChange}
      onBlur={onBlur}
      onOpenChange={onOpenChange}
      clearable={renderConfig.clearable}
      clearAccessibleName={renderConfig.clearAccessibleName}
      onClear={() => field.onChange('', { shouldDirty: true })}
      {...chrome}
      {...validation}
    />
  )
}
