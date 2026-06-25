'use client'

import { useController, type ControllerRenderProps } from 'react-hook-form'

import { ChooseFromChipsField } from '../components/ui/choose-from-chips-field.client'
import type { ChooseFromChipsFieldConfig } from './field-config'

export interface ChooseFromChipsFieldRendererProps {
  config: ChooseFromChipsFieldConfig
  field: ControllerRenderProps
  id: string
  error?: string
  namePrefix?: string
}

/** RHF adapter for `ChooseFromChipsField` — binds count + chip option paths. */
export function ChooseFromChipsFieldRenderer({
  config,
  field,
  id,
  error,
  namePrefix,
}: ChooseFromChipsFieldRendererProps) {
  const chooseFullName = namePrefix ? `${namePrefix}.${config.chooseName}` : config.chooseName
  const { field: chooseField, fieldState: chooseState } = useController({ name: chooseFullName })
  const combinedError = chooseState.error?.message ?? error

  const chipsValue = Array.isArray(field.value) ? field.value.map(String) : []

  return (
    <ChooseFromChipsField
      id={id}
      label={config.label}
      options={config.options}
      chooseValue={typeof chooseField.value === 'number' ? chooseField.value : undefined}
      onChooseChange={chooseField.onChange}
      onChooseBlur={chooseField.onBlur}
      chipsValue={chipsValue}
      onChipsChange={field.onChange}
      onChipsBlur={field.onBlur}
      chooseMin={config.chooseMin}
      chooseMax={config.chooseMax}
      prefix={config.prefix}
      suffix={config.suffix}
      error={combinedError}
      hint={config.hint}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      size={config.size}
      chipSize={config.chipSize}
      width={config.width}
    />
  )
}
