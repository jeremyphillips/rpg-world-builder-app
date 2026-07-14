'use client'

import { formatResolutionProjectilesPreview } from '@rpg/contracts'
import { FieldRow, SelectField, Text } from '@rpg/ui'
import { useId } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form'

import {
  applicationPatternFromForm,
  createDefaultProjectilesFormFields,
  type ResolutionApplicationPatternFormKind,
} from '../lib/resolution-application-pattern.lib'
import type { ResolutionFormValues } from '../lib/resolution-form-schema'
import {
  RESOLUTION_APPLICATION_PATTERN_OPTIONS,
  RESOLUTION_FIELD_LABELS,
  resolutionSaveAbilityOptions,
} from '../lib/resolution-form-labels'
import { RESOLUTION_FIELD_NAME } from '../lib/resolution-form-values'

const RESOLUTION_METHOD_OPTIONS = [
  { value: 'melee-spell', label: 'Melee spell attack' },
  { value: 'ranged-spell', label: 'Ranged spell attack' },
  { value: 'saving-throw', label: 'Saving throw' },
  { value: 'automatic', label: 'Automatic' },
] as const

type ResolutionMethodOption = (typeof RESOLUTION_METHOD_OPTIONS)[number]['value']

function toMethodOption(resolution: ResolutionFormValues | undefined): ResolutionMethodOption {
  if (!resolution) return 'ranged-spell'
  if (resolution.methodKind === 'automatic') return 'automatic'
  if (resolution.methodKind === 'saving-throw') return 'saving-throw'
  return resolution.attackType ?? 'ranged-spell'
}

function applyAutomaticMethod(resolution: ResolutionFormValues): ResolutionFormValues {
  return {
    ...resolution,
    methodKind: 'automatic',
    attackType: undefined,
    saveAbility: undefined,
  }
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
  attackType: Exclude<ResolutionMethodOption, 'saving-throw' | 'automatic'>,
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
  if (option === 'automatic') {
    return applyAutomaticMethod(resolution)
  }

  if (option === 'saving-throw') {
    return applySavingThrowMethod(resolution)
  }

  return applyAttackMethod(resolution, option)
}

function applyApplicationPatternOption(
  resolution: ResolutionFormValues,
  kind: ResolutionApplicationPatternFormKind,
): ResolutionFormValues {
  if (kind === 'none') {
    return {
      ...resolution,
      applicationPatternKind: 'none',
      projectileCount: undefined,
      projectileUnitLabelSingular: undefined,
      projectileUnitLabelPlural: undefined,
    }
  }

  if (resolution.applicationPatternKind === 'projectiles') {
    return { ...resolution, applicationPatternKind: 'projectiles' }
  }

  return {
    ...resolution,
    applicationPatternKind: 'projectiles',
    ...createDefaultProjectilesFormFields(),
  }
}

/** Method and application pattern on one row, with optional saving-throw follow-up. */
export function SpellResolutionHowItResolves() {
  const methodId = useId()
  const applicationPatternId = useId()
  const saveAbilityId = useId()
  const { control, setValue } = useFormContext()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const { field: saveAbilityField } = useController({
    control,
    name: `${RESOLUTION_FIELD_NAME}.saveAbility`,
  })

  if (!resolution) return null

  const methodValue = toMethodOption(resolution)
  const showSaveAbility = resolution.methodKind === 'saving-throw'

  return (
    <div className="space-y-4">
      <FieldRow>
        <SelectField
          id={methodId}
          label={RESOLUTION_FIELD_LABELS.method}
          value={methodValue}
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
        <SelectField
          id={applicationPatternId}
          label={RESOLUTION_FIELD_LABELS.applicationPattern}
          value={resolution.applicationPatternKind ?? 'none'}
          onValueChange={(next) => {
            setValue(
              RESOLUTION_FIELD_NAME,
              applyApplicationPatternOption(
                resolution,
                next as ResolutionApplicationPatternFormKind,
              ),
              { shouldDirty: true, shouldValidate: true },
            )
          }}
          options={[...RESOLUTION_APPLICATION_PATTERN_OPTIONS]}
          width="lg"
          hint={RESOLUTION_FIELD_LABELS.applicationPatternHint}
          hintPosition="below-control"
        />
      </FieldRow>
      {showSaveAbility ? (
        <FieldRow>
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
        </FieldRow>
      ) : null}
    </div>
  )
}

/** Live preview sentence for the projectiles conditional group. */
export function SpellResolutionProjectilesPreview() {
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const pattern = resolution ? applicationPatternFromForm(resolution) : undefined

  if (pattern?.kind !== 'projectiles') return null

  return (
    <Text as="p" variant="muted" className="text-sm" role="status">
      {formatResolutionProjectilesPreview(pattern)}
    </Text>
  )
}
