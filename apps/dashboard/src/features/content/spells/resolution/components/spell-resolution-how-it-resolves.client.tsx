'use client'

import { FieldRow, SelectField } from '@rpg/ui'
import { useId } from 'react'
import { useController, useFormContext, useWatch } from 'react-hook-form'

import {
  buildResolutionApplicationPatternOptions,
  buildResolutionMethodOptions,
  resolutionFormToSelectionContext,
} from '../lib/resolution-selection-context.lib'
import type { ResolutionApplicationPatternFormKind } from '../lib/resolution-application-pattern.lib'
import type { ResolutionFormValues } from '../lib/resolution-form-schema'
import {
  RESOLUTION_FIELD_LABELS,
  resolutionSaveAbilityOptions,
} from '../lib/resolution-form-labels'
import { RESOLUTION_FIELD_NAME } from '../lib/resolution-form-values'
import { useResolutionEditorContext } from '../lib/use-resolution-change-confirm.client'
import type { ResolutionMethodOption } from '@rpg/contracts'

function toMethodOption(resolution: ResolutionFormValues | undefined): ResolutionMethodOption {
  if (!resolution) return 'ranged-spell'
  if (resolution.methodKind === 'automatic') return 'automatic'
  if (resolution.methodKind === 'saving-throw') return 'saving-throw'
  return resolution.attackType ?? 'ranged-spell'
}

/** Method and application pattern on one row, with optional saving-throw follow-up. */
export function SpellResolutionHowItResolves() {
  const methodId = useId()
  const applicationPatternId = useId()
  const saveAbilityId = useId()
  const { control } = useFormContext()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const { requestResolutionChange } = useResolutionEditorContext()
  const context = resolutionFormToSelectionContext(resolution)
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
            requestResolutionChange({
              field: 'methodOption',
              value: next as ResolutionMethodOption,
            })
          }}
          options={buildResolutionMethodOptions(context)}
          width="lg"
        />
        <SelectField
          id={applicationPatternId}
          label={RESOLUTION_FIELD_LABELS.applicationPattern}
          value={resolution.applicationPatternKind ?? 'none'}
          onValueChange={(next) => {
            requestResolutionChange({
              field: 'applicationPatternKind',
              value: next as ResolutionApplicationPatternFormKind,
            })
          }}
          options={buildResolutionApplicationPatternOptions(context)}
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

export { SpellResolutionProjectilesPreview } from './spell-resolution-how-it-resolves-projectiles.client'
