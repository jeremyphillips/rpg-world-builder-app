'use client'

import { useWatch, type ControllerRenderProps } from 'react-hook-form'

import { InputSelectField } from '../components/ui/input-select-field.client'
import type { FieldDigits } from '../components/ui/field-digit-metrics'
import type { InputSelectFieldConfig } from './field-config'

function asRecord(value: unknown): Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function maxDigitsFromLookup(lookup: Record<string, FieldDigits>): FieldDigits {
  return Math.max(...Object.values(lookup).map(Number)) as FieldDigits
}

function resolveValueDigits(
  config: InputSelectFieldConfig,
  watchedKind: unknown,
): FieldDigits | undefined {
  if (config.valueDigits != null) return config.valueDigits
  if (!config.valueDigitsLookup) return undefined

  const lookup = config.valueDigitsLookup
  if (watchedKind == null || watchedKind === '') return maxDigitsFromLookup(lookup)

  return lookup[String(watchedKind)] ?? maxDigitsFromLookup(lookup)
}

export interface InputSelectFieldRendererProps {
  config: InputSelectFieldConfig
  field: ControllerRenderProps
  id: string
  error?: string
  /** Prefix for `valueDigitsDependsOn` paths inside array items (e.g. `traits.0`). */
  namePrefix?: string
}

/**
 * RHF adapter for `InputSelectField`: binds a nested object (`valueKey` / `unitKey`)
 * to the composite value + unit control.
 */
export function InputSelectFieldRenderer({
  config,
  field,
  id,
  error,
  namePrefix,
}: InputSelectFieldRendererProps) {
  const valueKey = config.valueKey ?? 'value'
  const unitKey = config.unitKey ?? 'unit'
  const dependsOn = config.valueDigitsDependsOn
  const prefixedDependsOn = dependsOn
    ? namePrefix
      ? `${namePrefix}.${dependsOn}`
      : dependsOn
    : undefined
  const watchedKind = useWatch({ name: prefixedDependsOn ?? '', disabled: !prefixedDependsOn })
  const valueDigits = resolveValueDigits(config, watchedKind)

  const obj = asRecord(field.value)
  const unit = obj[unitKey] != null ? String(obj[unitKey]) : ''
  const rawValue = obj[valueKey]
  const value =
    config.inputType === 'number'
      ? typeof rawValue === 'number'
        ? rawValue
        : undefined
      : rawValue != null
        ? String(rawValue)
        : undefined

  function updateObject(patch: Record<string, unknown>) {
    field.onChange({ ...obj, ...patch })
  }

  return (
    <InputSelectField
      id={id}
      label={config.label}
      inputType={config.inputType}
      options={config.options}
      searchable={config.searchable}
      unitPlaceholder={config.unitPlaceholder}
      error={error}
      hint={config.hint}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      unitDisabled={config.unitDisabled}
      size={config.size}
      width={config.width}
      min={config.min}
      max={config.max}
      step={config.step}
      placeholder={config.placeholder}
      valueDigits={valueDigits}
      value={value}
      unit={unit}
      onValueChange={(next) => updateObject({ [valueKey]: next })}
      onUnitChange={(next) => updateObject({ [unitKey]: next })}
      onBlur={field.onBlur}
    />
  )
}
