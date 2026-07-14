'use client'

import { useId } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { SelectField } from '@rpg/ui'

import type { ResolutionFormValues } from '../lib/resolution-form-schema'
import { RESOLUTION_FIELD_LABELS } from '../lib/resolution-form-labels'
import { RESOLUTION_FIELD_NAME } from './spell-resolution-empty-state.client'

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

function syncRangeForAttackType(
  resolution: ResolutionFormValues,
  attackType: Exclude<ResolutionMethodOption, 'saving-throw'>,
): Pick<ResolutionFormValues, 'rangeKind' | 'rangeDistanceFt' | 'reachDistanceFt'> {
  if (attackType === 'melee-spell' && resolution.rangeKind === 'distance') {
    return { rangeKind: 'reach', rangeDistanceFt: undefined, reachDistanceFt: undefined }
  }

  if (attackType === 'ranged-spell' && resolution.rangeKind === 'reach') {
    return {
      rangeKind: 'distance',
      rangeDistanceFt: resolution.rangeDistanceFt ?? 120,
      reachDistanceFt: undefined,
    }
  }

  return {
    rangeKind: resolution.rangeKind,
    rangeDistanceFt: resolution.rangeDistanceFt,
    reachDistanceFt: resolution.reachDistanceFt,
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
    ...syncRangeForAttackType(resolution, attackType),
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

/** Combined melee / ranged / saving-throw method picker for the resolution tab. */
export function SpellResolutionMethodSelect() {
  const selectId = useId()
  const { setValue } = useFormContext()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined

  if (!resolution) return null

  const value = toMethodOption(resolution)

  return (
    <SelectField
      id={selectId}
      label={RESOLUTION_FIELD_LABELS.methodKind}
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
  )
}
