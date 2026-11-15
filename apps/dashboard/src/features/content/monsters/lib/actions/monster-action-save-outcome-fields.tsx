import {
  getResolutionApplicationAmountLabel,
  RESOLUTION_APPLICATION_AMOUNTS,
  type ResolutionApplicationAmount,
} from '@rpg/contracts'
import { SelectField } from '@rpg/ui'
import { toOptions, useFieldControlSize, useSlotIssues } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import { MONSTER_SAVE_SUCCESS_AMOUNT_LABEL } from '../monster-form-labels'
import {
  monsterSaveDamageEffectId,
  monsterSaveOutcomeAmount,
  readMonsterSaveOutcomes,
  withMonsterSaveOutcomeAmount,
} from './monster-action-save-outcomes'

const SAVE_AMOUNT_OPTIONS = toOptions(
  RESOLUTION_APPLICATION_AMOUNTS,
  Object.fromEntries(
    RESOLUTION_APPLICATION_AMOUNTS.map((amount) => [
      amount,
      getResolutionApplicationAmountLabel(amount),
    ]),
  ) as Record<ResolutionApplicationAmount, string>,
)

function outcomesPath(namePrefix: string): string {
  return `${namePrefix}.resolution.outcomes`
}

export function MonsterActionSaveSuccessAmountField({ namePrefix }: { namePrefix: string }) {
  const controlSize = useFieldControlSize()
  const slotIssues = useSlotIssues()
  const { setValue } = useFormContext()
  const path = outcomesPath(namePrefix)
  const outcomes = readMonsterSaveOutcomes(useWatch({ name: path }))
  const effects = useWatch({ name: `${namePrefix}.resolution.effects` })

  return (
    <SelectField
      id={`${namePrefix.replaceAll('.', '-')}-save-success-amount`}
      label={MONSTER_SAVE_SUCCESS_AMOUNT_LABEL}
      placeholder="Choose"
      options={SAVE_AMOUNT_OPTIONS}
      value={monsterSaveOutcomeAmount(outcomes)}
      error={slotIssues.message}
      size={controlSize}
      width="full"
      onValueChange={(next) => {
        if (next !== 'full' && next !== 'half') return
        setValue(
          path,
          withMonsterSaveOutcomeAmount(outcomes, next, monsterSaveDamageEffectId(effects)),
          { shouldDirty: true, shouldValidate: true },
        )
      }}
    />
  )
}
