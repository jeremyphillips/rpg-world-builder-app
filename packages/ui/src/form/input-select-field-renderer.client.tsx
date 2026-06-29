'use client'

import { useController, useWatch } from 'react-hook-form'

import { InputSelectField } from '../components/ui/input-select-field.client'
import type { FieldDigits } from '../components/ui/field-digit-metrics'
import { fieldDefaultValue, type InputSelectFieldConfig } from './field-config'

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
  /** Full RHF path to the composite object (e.g. `cost`, `duration`, `castingTime.normal`). */
  fullName: string
  id: string
  /** Prefix for `valueDigitsDependsOn` paths inside array items (e.g. `traits.0`). */
  namePrefix?: string
}

/**
 * RHF adapter for `InputSelectField`: binds `valueKey` / `unitKey` as separate
 * nested paths (e.g. `duration.value`, `duration.unit`) so sibling dot-path
 * fields (`duration.kind`, …) can coexist and conditional remount restores
 * per-key defaults via `useController({ defaultValue })`.
 */
export function InputSelectFieldRenderer({
  config,
  fullName,
  id,
  namePrefix,
}: InputSelectFieldRendererProps) {
  const valueKey = config.valueKey ?? 'value'
  const unitKey = config.unitKey ?? 'unit'
  const valuePath = `${fullName}.${valueKey}`
  const unitPath = `${fullName}.${unitKey}`
  const configDefault = asRecord(fieldDefaultValue(config))

  const { field: valueField, fieldState: valueFieldState } = useController({
    name: valuePath,
    defaultValue: configDefault[valueKey],
  })
  const { field: unitField, fieldState: unitFieldState } = useController({
    name: unitPath,
    defaultValue: configDefault[unitKey],
  })

  const dependsOn = config.valueDigitsDependsOn
  const prefixedDependsOn = dependsOn
    ? namePrefix
      ? `${namePrefix}.${dependsOn}`
      : dependsOn
    : undefined
  const watchedKind = useWatch({ name: prefixedDependsOn ?? '', disabled: !prefixedDependsOn })
  const valueDigits = resolveValueDigits(config, watchedKind)

  const rawValue = valueField.value
  const value =
    config.inputType === 'number'
      ? typeof rawValue === 'number'
        ? rawValue
        : undefined
      : rawValue != null
        ? String(rawValue)
        : undefined
  const unit = unitField.value != null ? String(unitField.value) : ''

  const error = valueFieldState.error?.message ?? unitFieldState.error?.message

  function handleBlur() {
    valueField.onBlur()
    unitField.onBlur()
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
      hintPosition={config.hintPosition}
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
      formatGrouped={config.formatGrouped}
      value={value}
      unit={unit}
      onValueChange={valueField.onChange}
      onUnitChange={unitField.onChange}
      onBlur={handleBlur}
    />
  )
}
