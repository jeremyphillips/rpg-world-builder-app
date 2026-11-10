import {
  getResolutionApplicationAmountLabel,
  RESOLUTION_APPLICATION_AMOUNTS,
  type ResolutionApplicationAmount,
} from '@rpg/contracts'
import { SelectField, TextareaField } from '@rpg/ui'
import { toOptions, useFieldControlSize } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  MONSTER_SAVE_FAILURE_NOTE_LABEL,
  MONSTER_SAVE_SUCCESS_AMOUNT_LABEL,
} from '../monster-form-labels'
import {
  monsterSaveDamageEffectId,
  monsterSaveFailureNote,
  monsterSaveOutcomeAmount,
  readMonsterSaveOutcomes,
  withMonsterSaveFailureNote,
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

export function MonsterActionSaveFailureNoteField({ namePrefix }: { namePrefix: string }) {
  const controlSize = useFieldControlSize()
  const { setValue } = useFormContext()
  const outcomes = readMonsterSaveOutcomes(useWatch({ name: outcomesPath(namePrefix) }))
  const path = outcomesPath(namePrefix)

  return (
    <TextareaField
      id={`${namePrefix.replaceAll('.', '-')}-save-failure-note`}
      label={MONSTER_SAVE_FAILURE_NOTE_LABEL}
      rows={2}
      width="full"
      size={controlSize}
      value={monsterSaveFailureNote(outcomes)}
      onChange={(event) => {
        setValue(path, withMonsterSaveFailureNote(outcomes, event.target.value), {
          shouldDirty: true,
          shouldValidate: true,
        })
      }}
    />
  )
}

export function MonsterActionSaveSuccessAmountField({ namePrefix }: { namePrefix: string }) {
  const controlSize = useFieldControlSize()
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
