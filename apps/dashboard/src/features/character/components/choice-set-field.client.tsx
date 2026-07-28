'use client'

import type { ChoiceSet } from '@rpg/contracts'
import { ChipsField, ComboboxField, RadioCardField } from '@rpg/ui'

import {
  formatChoiceSetSelectionHint,
  mapChoiceSetOptionsToComboboxOptions,
  mapChoiceSetOptionsToFieldOptions,
  mapChoiceSetOptionsToRadioCardOptions,
  normalizeChoiceSetSelection,
  resolveChoiceSetFieldVariant,
} from '../lib/choice-sets/choice-set-field.lib'

export type ChoiceSetFieldProps = {
  choiceSet: ChoiceSet
  value: string[]
  onValueChange: (selections: string[]) => void
  disabled?: boolean
}

export function ChoiceSetField({
  choiceSet,
  value,
  onValueChange,
  disabled = false,
}: ChoiceSetFieldProps) {
  const fieldId = `character-builder-choice-set-${choiceSet.id}`
  const hint = formatChoiceSetSelectionHint(choiceSet)
  const variant = resolveChoiceSetFieldVariant(choiceSet)

  const handleValueChange = (nextValue: string | string[] | undefined) => {
    onValueChange(normalizeChoiceSetSelection(nextValue, choiceSet.max))
  }

  if (variant === 'single-card') {
    return (
      <RadioCardField
        id={fieldId}
        label={choiceSet.label}
        hint={hint}
        required={choiceSet.required}
        disabled={disabled}
        value={value[0] ?? ''}
        onValueChange={(nextValue) => {
          handleValueChange(nextValue)
        }}
        options={mapChoiceSetOptionsToRadioCardOptions(choiceSet.options)}
      />
    )
  }

  if (variant === 'searchable-combobox') {
    const multiple = choiceSet.max > 1

    return (
      <ComboboxField
        id={fieldId}
        label={choiceSet.label}
        hint={hint}
        required={choiceSet.required}
        disabled={disabled}
        multiple={multiple}
        max={multiple ? choiceSet.max : undefined}
        value={multiple ? value : (value[0] ?? '')}
        onChange={handleValueChange}
        options={mapChoiceSetOptionsToComboboxOptions(choiceSet.options)}
        placeholder={multiple ? 'Search and add options…' : 'Search options…'}
        emptyMessage="No matching options"
      />
    )
  }

  return (
    <ChipsField
      id={fieldId}
      label={choiceSet.label}
      hint={hint}
      required={choiceSet.required}
      multiple
      max={choiceSet.max}
      disabled={disabled}
      value={value}
      onChange={handleValueChange}
      options={mapChoiceSetOptionsToFieldOptions(choiceSet.options)}
    />
  )
}
