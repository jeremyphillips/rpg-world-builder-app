'use client'

import { SelectField, Text } from '@rpg/ui'
import { useArrayFieldContext, useFormSectionContext } from '@rpg/ui/form'
import { useController, useFormContext, useWatch } from 'react-hook-form'

import {
  formatResolutionEffectCompletenessMessage,
  getResolutionEffectCompleteness,
} from '../../lib/form/resolution-effect-validity.lib'
import { amountOptionsForEffect } from '../../lib/form/resolution-outcome-applications-form-fields'
import { findResolutionEffectById } from '../../lib/form/resolution-outcome-display.lib'
import { RESOLUTION_FIELD_LABELS } from '../../lib/form/resolution-form-labels'
import type {
  ResolutionEffectFormItem,
  ResolutionOutcomeApplicationFormItem,
} from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'

const RESOLUTION_EFFECTS_FIELD = `${RESOLUTION_FIELD_NAME}.effects` as const

function OutcomeApplicationAmountField({
  rowPrefix,
  effect,
}: {
  rowPrefix: string
  effect: ResolutionEffectFormItem | undefined
}) {
  const { control } = useFormContext()
  const { size } = useFormSectionContext()
  const completeness = effect
    ? getResolutionEffectCompleteness(effect)
    : { complete: true as const }
  const amountOptions = amountOptionsForEffect(effect)
  const { field, fieldState } = useController({
    control,
    name: `${rowPrefix}.amount`,
  })

  return (
    <SelectField
      id={`${rowPrefix}-amount`}
      name={field.name}
      label={RESOLUTION_FIELD_LABELS.outcomeApplicationAmount}
      options={amountOptions}
      size={size}
      width="lg"
      value={field.value ?? 'full'}
      disabled={!completeness.complete}
      error={fieldState.error?.message}
      onValueChange={field.onChange}
      onBlur={field.onBlur}
    />
  )
}

/** Completeness messaging and amount control for one outcome application row. */
export function SpellResolutionOutcomeApplicationStatus() {
  const arrayContext = useArrayFieldContext()
  const effects =
    (useWatch({ name: RESOLUTION_EFFECTS_FIELD }) as ResolutionEffectFormItem[] | undefined) ?? []
  const rowPrefix = arrayContext?.fullArrayName
    ? `${arrayContext.fullArrayName}.${arrayContext.rowIndex}`
    : ''
  const row = useWatch({ name: rowPrefix }) as ResolutionOutcomeApplicationFormItem | undefined

  if (!arrayContext?.fullArrayName || !rowPrefix) return null

  const effect = row ? findResolutionEffectById(effects, row.effectId) : undefined
  const completeness = effect
    ? getResolutionEffectCompleteness(effect)
    : { complete: true as const }

  return (
    <div className="space-y-2">
      {!completeness.complete && effect ? (
        <Text variant="muted" className="text-sm">
          {formatResolutionEffectCompletenessMessage(effect, completeness)}
        </Text>
      ) : null}

      <OutcomeApplicationAmountField rowPrefix={rowPrefix} effect={effect} />
    </div>
  )
}
