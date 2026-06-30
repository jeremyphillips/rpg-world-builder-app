'use client'

import { useController, useWatch } from 'react-hook-form'

import { InputSelectField } from '../../components/ui/input-select-field.client'
import { resolveValueDigitsFromConfig } from '../config/input-field-value-digits.lib'
import { fieldDefaultValue, type InputSelectFieldConfig } from '../field-config'

function asRecord(value: unknown): Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
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
function resolvePrefixedDependsOn(
  namePrefix: string | undefined,
  dependsOn: string | undefined,
): string | undefined {
  if (!dependsOn) return undefined
  return namePrefix ? `${namePrefix}.${dependsOn}` : dependsOn
}

function coerceInputSelectValue(
  inputType: InputSelectFieldConfig['inputType'],
  rawValue: unknown,
): number | string | undefined {
  if (inputType === 'number') {
    return typeof rawValue === 'number' ? rawValue : undefined
  }
  return rawValue != null ? String(rawValue) : undefined
}

function inputSelectFieldError(
  valueError: string | undefined,
  unitError: string | undefined,
): string | undefined {
  return valueError ?? unitError
}

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
  const isFixedUnit = Boolean(config.fixedUnit)

  const { field: valueField, fieldState: valueFieldState } = useController({
    name: valuePath,
    defaultValue: configDefault[valueKey],
  })
  const { field: unitField, fieldState: unitFieldState } = useController({
    name: unitPath,
    defaultValue: config.unitValue ?? configDefault[unitKey],
  })

  const prefixedDependsOn = resolvePrefixedDependsOn(namePrefix, config.valueDigitsDependsOn)
  const watchedKind = useWatch({ name: prefixedDependsOn ?? '', disabled: !prefixedDependsOn })
  const valueDigits = resolveValueDigitsFromConfig(config, watchedKind)
  const value = coerceInputSelectValue(config.inputType, valueField.value)
  const unit = unitField.value != null ? String(unitField.value) : ''
  const error = inputSelectFieldError(valueFieldState.error?.message, unitFieldState.error?.message)

  function handleBlur() {
    valueField.onBlur()
    unitField.onBlur()
  }

  return (
    <InputSelectField
      id={id}
      label={config.label}
      inputType={config.inputType}
      options={config.options ?? []}
      searchable={config.searchable}
      unitPlaceholder={config.unitPlaceholder}
      error={error}
      hint={config.hint}
      hintPosition={config.hintPosition}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      unitDisabled={config.unitDisabled}
      unitMode={isFixedUnit ? 'label' : 'select'}
      fixedUnit={config.fixedUnit}
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
      onUnitChange={isFixedUnit ? () => undefined : unitField.onChange}
      onBlur={handleBlur}
    />
  )
}
