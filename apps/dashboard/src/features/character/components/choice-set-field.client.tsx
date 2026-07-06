'use client'

import type { ChoiceSet } from '@rpg/contracts'
import { ChipsField } from '@rpg/ui'

import { formatChoiceSetSelectionHint } from '../lib/proficiencies-step.lib'

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

  return (
    <ChipsField
      id={fieldId}
      label={choiceSet.label}
      hint={formatChoiceSetSelectionHint(choiceSet)}
      required={choiceSet.required}
      multiple
      max={choiceSet.max}
      disabled={disabled}
      value={value}
      onChange={(nextValue) => {
        onValueChange(Array.isArray(nextValue) ? nextValue : nextValue ? [nextValue] : [])
      }}
      options={choiceSet.options.map((option) => ({
        value: option.id,
        label: option.label,
      }))}
    />
  )
}
