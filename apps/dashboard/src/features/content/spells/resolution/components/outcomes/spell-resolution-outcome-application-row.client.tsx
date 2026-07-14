'use client'

import { supportsPartialApplicationForEffectKind } from '@rpg/contracts'
import { Button, FieldRow, SelectField, Text } from '@rpg/ui'
import type { FieldOption } from '@rpg/ui/form'
import { Trash2 } from 'lucide-react'
import { useId } from 'react'
import { useController, useFormContext } from 'react-hook-form'

import { formatOutcomeApplicationRowLabel } from '../../lib/form/resolution-outcome-form-fields'
import { findResolutionEffectById } from '../../lib/form/resolution-outcome-display.lib'
import { RESOLUTION_OUTCOME_AMOUNT_OPTIONS } from '../../lib/form/resolution-form-labels'
import type {
  ResolutionEffectFormItem,
  ResolutionOutcomeApplicationFormItem,
} from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'

const OUTCOMES_FIELD = `${RESOLUTION_FIELD_NAME}.outcomes` as const

function outcomeApplicationAmountFieldPath(
  outcomeIndex: number,
  applicationIndex: number,
): `${typeof OUTCOMES_FIELD}.${number}.applications.${number}.amount` {
  return `${OUTCOMES_FIELD}.${outcomeIndex}.applications.${applicationIndex}.amount`
}

function amountOptionsForEffect(effect: ResolutionEffectFormItem | undefined): FieldOption[] {
  if (!effect || !supportsPartialApplicationForEffectKind(effect.kind)) {
    return RESOLUTION_OUTCOME_AMOUNT_OPTIONS.filter((option) => option.value === 'full').map(
      (option) => ({ ...option }),
    )
  }
  return RESOLUTION_OUTCOME_AMOUNT_OPTIONS.map((option) => ({ ...option }))
}

export type SpellResolutionOutcomeApplicationRowProps = {
  outcomeIndex: number
  applicationIndex: number
  application: ResolutionOutcomeApplicationFormItem
  effects: readonly ResolutionEffectFormItem[]
  onRemove: () => void
}

/** One complete outcome application row with effect label, amount, and remove. */
export function SpellResolutionOutcomeApplicationRow({
  outcomeIndex,
  applicationIndex,
  application,
  effects,
  onRemove,
}: SpellResolutionOutcomeApplicationRowProps) {
  const amountId = useId()
  const { control } = useFormContext()
  const { field: amountField, fieldState: amountFieldState } = useController({
    control,
    name: outcomeApplicationAmountFieldPath(outcomeIndex, applicationIndex),
  })
  const effect = findResolutionEffectById(effects, application.effectId)
  const label = formatOutcomeApplicationRowLabel(effects, application)

  return (
    <div className="flex flex-wrap items-end gap-2 rounded-md border border-border p-3">
      <div className="min-w-0 flex-1">
        <Text as="p" className="text-sm font-medium">
          {label}
        </Text>
      </div>
      <FieldRow className="items-end">
        <SelectField
          id={amountId}
          label="Amount"
          value={amountField.value}
          onValueChange={amountField.onChange}
          onBlur={amountField.onBlur}
          options={amountOptionsForEffect(effect)}
          error={amountFieldState.error?.message}
          width="auto"
          size="sm"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="size-8 shrink-0 p-0"
          aria-label={`Remove ${label} from outcome`}
          onClick={onRemove}
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </FieldRow>
    </div>
  )
}
