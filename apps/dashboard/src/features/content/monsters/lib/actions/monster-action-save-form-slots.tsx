'use client'

import { SelectField, TextareaField } from '@rpg/ui'
import { toOptions, useFieldControlSize, useSlotIssues } from '@rpg/ui/form'
import { OptionalFieldDisclosure } from '@rpg/ui'
import { useEffect, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  MONSTER_SAVE_FAILURE_OR_SUCCESS_ADD_LABEL,
  MONSTER_SAVE_FAILURE_OR_SUCCESS_NOTE_LABEL,
  MONSTER_SAVE_REPEAT_ADD_LABEL,
  MONSTER_SAVE_REPEAT_ELIGIBILITY_LABEL,
  MONSTER_SAVE_REPEAT_REMOVE_LABEL,
  MONSTER_SAVE_REPEAT_TIMING_LABEL,
} from '../monster-form-labels'
import {
  REPEAT_SAVE_TIMING_OPTIONS,
  repeatSaveTimingFromOptionId,
  repeatSaveTimingOptionId,
} from './monster-action-repeat-save-timing.lib'
import {
  defaultRepeatSaveShell,
  ensureMonsterSaveOutcomeSlots,
  monsterSaveFailureOrSuccessNote,
  readMonsterSaveOutcomes,
  shouldShowSaveRepeatSaveAuthoring,
  withMonsterSaveFailureOrSuccessOutcome,
  withMonsterSaveRepeatSave,
  type MonsterSaveOutcome,
} from './monster-action-save-outcomes'
import { findOutcomeByResult, type RepeatSave } from '@rpg/contracts'

const WRITE_OPTIONS = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const

function outcomesPath(namePrefix: string): string {
  return `${namePrefix}.resolution.outcomes`
}

const FAILED_EFFECTS_SUFFIX = 'resolution.outcomes.0.effects'
const REPEAT_SAVE_SUFFIX = 'resolution.outcomes.0.repeatSave'

function watchPath(namePrefix: string, suffix: string): string {
  return namePrefix ? `${namePrefix}.${suffix}` : suffix
}

export function MonsterActionSaveEnsureOutcomeSlotsField({ namePrefix }: { namePrefix: string }) {
  const { setValue, getValues } = useFormContext()
  const path = outcomesPath(namePrefix)
  const outcomes = useWatch({ name: path })

  useEffect(() => {
    const current = readMonsterSaveOutcomes(getValues(path))
    const slotted = ensureMonsterSaveOutcomeSlots(current)
    const optional = findOutcomeByResult(current, 'failed-or-successful-save')
    const merged = optional ? [...slotted, optional] : slotted
    if (JSON.stringify(merged) !== JSON.stringify(current)) {
      setValue(path, merged as MonsterSaveOutcome[], {
        shouldDirty: false,
        shouldValidate: false,
      })
    }
  }, [getValues, namePrefix, outcomes, path, setValue])

  return null
}

export function MonsterActionSaveRepeatSaveField({ namePrefix }: { namePrefix: string }) {
  const controlSize = useFieldControlSize()
  const { setValue } = useFormContext()
  const outcomes = readMonsterSaveOutcomes(useWatch({ name: outcomesPath(namePrefix) }))
  const failedEffects = useWatch({ name: watchPath(namePrefix, FAILED_EFFECTS_SUFFIX) })
  const repeatSave = useWatch({ name: watchPath(namePrefix, REPEAT_SAVE_SUFFIX) }) as
    | RepeatSave
    | undefined
  const outcomesPathValue = outcomesPath(namePrefix)
  const visible = shouldShowSaveRepeatSaveAuthoring(failedEffects, repeatSave)
  if (!visible) return null

  const open = repeatSave != null
  const fieldId = `${namePrefix.replaceAll('.', '-')}-repeat-save`
  const timingOptions = toOptions(
    REPEAT_SAVE_TIMING_OPTIONS.map((option) => option.id),
    Object.fromEntries(REPEAT_SAVE_TIMING_OPTIONS.map((option) => [option.id, option.label])),
  )

  const writeRepeat = (next: RepeatSave | undefined) => {
    setValue(outcomesPathValue, withMonsterSaveRepeatSave(outcomes, next), WRITE_OPTIONS)
  }

  return (
    <OptionalFieldDisclosure
      controlId={fieldId}
      fieldLabel={MONSTER_SAVE_REPEAT_ADD_LABEL}
      addLabel={MONSTER_SAVE_REPEAT_ADD_LABEL}
      removeLabel={MONSTER_SAVE_REPEAT_REMOVE_LABEL}
      open={open}
      onOpenChange={(next) => {
        if (next && !repeatSave) writeRepeat(defaultRepeatSaveShell())
      }}
      onRemove={() => writeRepeat(undefined)}
      size={controlSize}
    >
      <SelectField
        id={`${fieldId}-timing`}
        label={MONSTER_SAVE_REPEAT_TIMING_LABEL}
        placeholder="Choose"
        size={controlSize}
        width="full"
        options={timingOptions}
        value={repeatSaveTimingOptionId(repeatSave?.timing) ?? ''}
        onValueChange={(next) => {
          const timing = repeatSaveTimingFromOptionId(next)
          if (!timing || !repeatSave) return
          writeRepeat({ ...repeatSave, timing })
        }}
      />
      <TextareaField
        id={`${fieldId}-eligibility`}
        label={MONSTER_SAVE_REPEAT_ELIGIBILITY_LABEL}
        rows={2}
        width="full"
        size={controlSize}
        value={repeatSave?.eligibilityNote ?? ''}
        onChange={(event) => {
          if (!repeatSave) return
          const eligibilityNote = event.target.value
          const trimmed = eligibilityNote.trim()
          if (!trimmed) {
            const { eligibilityNote: _removed, ...rest } = repeatSave
            writeRepeat(rest)
            return
          }
          writeRepeat({ ...repeatSave, eligibilityNote: trimmed })
        }}
      />
    </OptionalFieldDisclosure>
  )
}

export function MonsterActionSaveFailureOrSuccessField({ namePrefix }: { namePrefix: string }) {
  const controlSize = useFieldControlSize()
  const { setValue } = useFormContext()
  const path = outcomesPath(namePrefix)
  const outcomes = readMonsterSaveOutcomes(useWatch({ name: path }))
  const existing = outcomes.find((outcome) => outcome.result === 'failed-or-successful-save')
  const [open, setOpen] = useState(existing != null)
  const fieldId = `${namePrefix.replaceAll('.', '-')}-failure-or-success`

  return (
    <OptionalFieldDisclosure
      controlId={fieldId}
      fieldLabel={MONSTER_SAVE_FAILURE_OR_SUCCESS_ADD_LABEL}
      addLabel={MONSTER_SAVE_FAILURE_OR_SUCCESS_ADD_LABEL}
      removeLabel="Remove"
      open={open || existing != null}
      onOpenChange={(next) => {
        setOpen(next)
        if (next && !existing) {
          const slotted = ensureMonsterSaveOutcomeSlots(outcomes)
          setValue(
            path,
            [
              ...slotted,
              { result: 'failed-or-successful-save', applications: [] },
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
