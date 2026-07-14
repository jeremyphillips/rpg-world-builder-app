'use client'

import { useId } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form'
import { FieldRow, SelectField } from '@rpg/ui'

import type { ResolutionFormValues } from '../lib/resolution-form-schema'
import {
  RESOLUTION_FIELD_LABELS,
  resolutionSaveAbilityOptions,
} from '../lib/resolution-form-labels'
import { RESOLUTION_FIELD_NAME } from '../lib/resolution-form-values'

const RESOLUTION_METHOD_OPTIONS = [
  { value: 'melee-spell', label: 'Melee spell attack' },
  { value: 'ranged-spell', label: 'Ranged spell attack' },
  { value: 'saving-throw', label: 'Saving throw' },
] as const

type ResolutionMethodOption = (typeof RESOLUTION_METHOD_OPTIONS)[number]['value']

function toMethodOption(resolution: ResolutionFormValues | undefined): ResolutionMethodOption {
  if (!resolution) return 'ranged-spell'
  if (resolution.methodKind === 'saving-throw') return 'saving-throw'
  return resolution.attackType ?? 'ranged-spell'
}

function applySavingThrowMethod(resolution: ResolutionFormValues): ResolutionFormValues {
  return {
    ...resolution,
    methodKind: 'saving-throw',
    saveAbility: resolution.saveAbility ?? 'con',
    attackType: undefined,
  }
}

function applyAttackMethod(
  resolution: ResolutionFormValues,
  attackType: Exclude<ResolutionMethodOption, 'saving-throw'>,
): ResolutionFormValues {
  return {
    ...resolution,
    methodKind: 'attack',
    attackType,
    saveAbility: undefined,
  }
}

function applyMethodOption(
  resolution: ResolutionFormValues,
  option: ResolutionMethodOption,
): ResolutionFormValues {
  if (option === 'saving-throw') {
    return applySavingThrowMethod(resolution)
  }

  return applyAttackMethod(resolution, option)
}

/** Method and conditional saving-throw ability on one row. */
export function SpellResolutionMethodSelect() {
  const methodId = useId()
  const saveAbilityId = useId()
  const { control, setValue } = useFormContext()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const { field: saveAbilityField } = useController({
    control,
    name: `${RESOLUTION_FIELD_NAME}.saveAbility`,
  })

  if (!resolution) return null

  const value = toMethodOption(resolution)
  const showSaveAbility = resolution.methodKind === 'saving-throw'

  return (
    <FieldRow>
      <SelectField
        id={methodId}
        label={RESOLUTION_FIELD_LABELS.method}
        value={value}
        onValueChange={(next) => {
          setValue(
            RESOLUTION_FIELD_NAME,
            applyMethodOption(resolution, next as ResolutionMethodOption),
            { shouldDirty: true, shouldValidate: true },
          )
        }}
        options={[...RESOLUTION_METHOD_OPTIONS]}
        width="lg"
      />
      {showSaveAbility ? (
        <SelectField
          id={saveAbilityId}
          label={RESOLUTION_FIELD_LABELS.saveAbility}
          value={saveAbilityField.value}
          onValueChange={saveAbilityField.onChange}
          onBlur={saveAbilityField.onBlur}
          options={resolutionSaveAbilityOptions}
          width="md"
          required
        />
      ) : null}
    </FieldRow>
  )
}
