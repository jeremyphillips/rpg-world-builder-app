import { SelectField } from '@rpg/ui'
import {
  resolveFieldErrorMessage,
  resolveNestedFieldErrorMessage,
  useFieldControlSize,
} from '@rpg/ui/form'
import { useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { monsterAttackAbilitySelectOptions } from './monster-casting-ability-options'
import type { MonsterFormValues } from '../monster-form-values'

export function MonsterActionAttackAbilityField({
  name,
  proficientName,
  required = true,
}: {
  name: string
  proficientName: string
  required?: boolean
}) {
  const controlSize = useFieldControlSize()
  const { setValue, formState } = useFormContext<MonsterFormValues>()
  const abilityScores = useWatch({ name: 'abilityScores' })
  const challengeRating = useWatch({ name: 'challengeRating' })
  const proficient = useWatch({ name: proficientName })
  const current = useWatch({ name })
  const proficientFlag = typeof proficient === 'boolean' ? proficient : undefined
  const options = useMemo(
    () =>
      monsterAttackAbilitySelectOptions(
        { abilityScores, challengeRating } as MonsterFormValues,
        proficientFlag,
      ),
    [abilityScores, challengeRating, proficientFlag],
  )
  const value = typeof current === 'string' ? current : ''
  const fieldId = `${name.replaceAll('.', '-')}-attack-ability`
  const error = resolveFieldErrorMessage(resolveNestedFieldErrorMessage(formState.errors, name))

  return (
    <SelectField
      id={fieldId}
      name={name}
      label="Ability"
      required={required}
      placeholder="Choose"
      options={options}
      value={value}
      size={controlSize}
      width="full"
      error={error}
      invalid={Boolean(error)}
      onValueChange={(next) => {
        setValue(name as never, (next || undefined) as never, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }}
    />
  )
}
