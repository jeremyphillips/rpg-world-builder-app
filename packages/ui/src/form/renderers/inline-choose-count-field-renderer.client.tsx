'use client'

import { useController, type ControllerRenderProps } from 'react-hook-form'

import { InlineChooseCountField } from '../../components/ui/inline-choose-count-field.client'
import type { InlineChooseCountFieldConfig } from '../field-config'
import { resolveFirstFieldErrorMessage } from '../errors/resolve-field-error-message'

export interface InlineChooseCountFieldRendererProps {
  config: InlineChooseCountFieldConfig
  field: ControllerRenderProps
  id: string
  error?: string
  namePrefix?: string
}

/** RHF adapter for `InlineChooseCountField`. */
export function InlineChooseCountFieldRenderer({
  config,
  field,
  id,
  error,
  namePrefix,
}: InlineChooseCountFieldRendererProps) {
  const selectFullName = config.selectName
    ? namePrefix
      ? `${namePrefix}.${config.selectName}`
      : config.selectName
    : undefined
  const { field: selectField, fieldState: selectState } = useController({
    name: selectFullName ?? '__inlineChooseCountSelectUnused',
    disabled: !selectFullName,
  })
  const combinedError = resolveFirstFieldErrorMessage(selectState.error?.message, error)

  return (
    <InlineChooseCountField
      id={id}
      label={config.label}
      value={typeof field.value === 'number' ? field.value : undefined}
      onChange={field.onChange}
      onBlur={field.onBlur}
      chooseMin={config.chooseMin}
      chooseMax={config.chooseMax}
      prefix={config.prefix}
      suffix={config.suffix}
      digits={config.digits}
      selectId={selectFullName ? `${id}-select` : undefined}
      selectLabel={config.selectLabel}
      selectValue={typeof selectField.value === 'string' ? selectField.value : undefined}
      selectOptions={config.selectOptions}
      onSelectChange={selectField.onChange}
      onSelectBlur={selectField.onBlur}
      error={combinedError}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      size={config.size}
      width={config.width}
      hideLabel={config.hideLabel}
    />
  )
}
