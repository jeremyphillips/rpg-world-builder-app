'use client'

import { useController } from 'react-hook-form'

import { DiceFormulaField } from '../../../components/ui/dice-formula-field.client'
import type { DiceFormulaValue } from '../../../components/ui/dice-formula-field.lib'
import type { FieldHintPosition } from '../../../components/ui/field.variants'
import type { DiceFormulaFieldConfig } from '../../field-config'
import { useFieldControlSize } from '../../context/form-section.context'

export interface DiceFormulaFieldRendererProps {
  config: DiceFormulaFieldConfig
  field: {
    value: unknown
    onChange: (value: DiceFormulaValue) => void
    onBlur: () => void
  }
  id: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  namePrefix?: string
}

/** Binds optional sibling currency field when `currencyUnit` is configured. */
export function DiceFormulaFieldRenderer({
  config,
  field,
  id,
  error,
  hint,
  hintPosition,
  namePrefix,
}: DiceFormulaFieldRendererProps) {
  const controlSize = useFieldControlSize(config)
  const currencyConfig = config.currencyUnit
  const currencyName =
    currencyConfig && namePrefix ? `${namePrefix}.${currencyConfig.name ?? 'currency'}` : undefined

  const { field: currencyField } = useController({
    name: currencyName ?? `${config.name}.__currency`,
    disabled: !currencyName,
  })

  const currencyUnit =
    currencyConfig && currencyName
      ? {
          value: String(currencyField.value ?? currencyConfig.defaultValue),
          options: currencyConfig.options,
          onChange: currencyField.onChange,
        }
      : undefined

  return (
    <DiceFormulaField
      id={id}
      label={config.label}
      error={error}
      hint={hint}
      hintPosition={hintPosition}
      info={config.info}
      required={config.required}
      width={config.width}
      size={controlSize}
      disabled={config.disabled}
      labelPosition={config.labelPosition}
      modifierMode={config.modifierMode}
      faces={config.faces}
      countMin={config.countMin}
      countMax={config.countMax}
      modifierMin={config.modifierMin}
      modifierMax={config.modifierMax}
      modifierOperators={config.modifierOperators}
      modifierAmountLabel={config.modifierAmountLabel}
      currencyUnit={currencyUnit}
      value={(field.value as DiceFormulaValue | undefined) ?? undefined}
      onChange={field.onChange}
      onBlur={field.onBlur}
    />
  )
}
