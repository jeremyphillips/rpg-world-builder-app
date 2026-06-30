'use client'

import type { ControllerRenderProps } from 'react-hook-form'
import { useWatch } from 'react-hook-form'

import { InputUnitField } from '../components/ui/input-select-field.client'
import { resolveValueDigitsFromConfig } from './input-field-value-digits'
import type { InputUnitFieldConfig } from './field-config'

export interface InputUnitFieldRendererProps {
  config: InputUnitFieldConfig
  field: ControllerRenderProps
  id: string
  error?: string
  /** Prefix for `valueDigitsDependsOn` paths inside array items (e.g. `traits.0`). */
  namePrefix?: string
}

/** RHF adapter for scalar `InputUnitField` bindings. */
export function InputUnitFieldRenderer({
  config,
  field,
  id,
  error,
  namePrefix,
}: InputUnitFieldRendererProps) {
  const dependsOn = config.valueDigitsDependsOn
  const prefixedDependsOn = dependsOn
    ? namePrefix
      ? `${namePrefix}.${dependsOn}`
      : dependsOn
    : undefined
  const watchedKind = useWatch({ name: prefixedDependsOn ?? '', disabled: !prefixedDependsOn })
  const valueDigits = resolveValueDigitsFromConfig(config, watchedKind)

  const value = typeof field.value === 'number' ? field.value : undefined

  return (
    <InputUnitField
      id={id}
      label={config.label}
      inputType="number"
      unit={config.unit}
      error={error}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      size={config.size}
      width={config.width}
      min={config.min}
      max={config.max}
      step={config.step}
      valueDigits={valueDigits}
      formatGrouped={config.formatGrouped}
      value={value}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  )
}
