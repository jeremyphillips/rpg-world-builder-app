import { OptionalFieldDisclosure, TextareaField } from '@rpg/ui'
import {
  optionalDisclosureShellProps,
  resolveOptionalDisclosureActions,
  useFieldControlSize,
} from '@rpg/ui/form'
import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  MONSTER_SAVE_FAILURE_OR_SUCCESS_NOTE_LABEL,
  MONSTER_SAVE_OUTCOME_DISCLOSURE_LABEL,
} from '../../../../lib/monster-form-labels'
import {
  ensureMonsterSaveOutcomeSlots,
  monsterSaveFailureOrSuccessNote,
  readMonsterSaveOutcomes,
  saveOutcomesPath,
  withMonsterSaveFailureOrSuccessOutcome,
  type MonsterSaveOutcome,
} from '../../../../lib/actions/save/monster-action-save-outcomes'

const WRITE_OPTIONS = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const

export function MonsterActionSaveFailureOrSuccessField({ namePrefix }: { namePrefix: string }) {
  const controlSize = useFieldControlSize()
  const { setValue } = useFormContext()
  const path = saveOutcomesPath(namePrefix)
  const outcomes = readMonsterSaveOutcomes(useWatch({ name: path }))
  const existing = outcomes.find((outcome) => outcome.result === 'failed-or-successful-save')
  const [open, setOpen] = useState(existing != null)
  const fieldId = `${namePrefix.replaceAll('.', '-')}-failure-or-success`
  const actions = resolveOptionalDisclosureActions({
    intent: 'add',
    subject: 'save outcome',
  })

  return (
    <OptionalFieldDisclosure
      controlId={fieldId}
      fieldLabel={MONSTER_SAVE_OUTCOME_DISCLOSURE_LABEL}
      {...optionalDisclosureShellProps(actions)}
      open={open || existing != null}
      onOpenChange={(next) => {
        setOpen(next)
        if (next && !existing) {
          const slotted = ensureMonsterSaveOutcomeSlots(outcomes)
          setValue(
            path,
            [
              ...slotted,
              { result: 'failed-or-successful-save', effects: [] },
            ] as MonsterSaveOutcome[],
            WRITE_OPTIONS,
          )
        }
      }}
      onRemove={() => {
        setOpen(false)
        setValue(path, withMonsterSaveFailureOrSuccessOutcome(outcomes, ''), WRITE_OPTIONS)
      }}
      size={controlSize}
    >
      <TextareaField
        id={`${fieldId}-note`}
        label={MONSTER_SAVE_FAILURE_OR_SUCCESS_NOTE_LABEL}
        rows={2}
        width="full"
        size={controlSize}
        required
        value={monsterSaveFailureOrSuccessNote(outcomes)}
        onChange={(event) => {
          setValue(
            path,
            withMonsterSaveFailureOrSuccessOutcome(outcomes, event.target.value),
            WRITE_OPTIONS,
          )
        }}
      />
    </OptionalFieldDisclosure>
  )
}
