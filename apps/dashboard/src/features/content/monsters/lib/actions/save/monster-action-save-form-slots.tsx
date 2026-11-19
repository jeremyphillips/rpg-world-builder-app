import { Button, ConfirmDialog, OptionalFieldDisclosure, TextareaField } from '@rpg/ui'
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
  MONSTER_SAVE_REPEAT_ADD_LABEL,
} from '../../monster-form-labels'
import {
  defaultRepeatSaveShell,
  ensureMonsterSaveOutcomeSlots,
  MONSTER_SAVE_FAILED_EFFECTS_PATH,
  MONSTER_SAVE_REPEAT_PATH,
  monsterSaveFailureOrSuccessNote,
  readMonsterSaveOutcomes,
  repeatSaveRemovalNeedsConfirm,
  repeatSaveShellIsOpen,
  shouldShowSaveRepeatSaveAuthoring,
  withMonsterSaveFailureOrSuccessOutcome,
  withMonsterSaveRepeatSave,
  type MonsterSaveOutcome,
} from './monster-action-save-outcomes'
const WRITE_OPTIONS = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const

function outcomesPath(namePrefix: string): string {
  return `${namePrefix}.resolution.outcomes`
}

const FAILED_EFFECTS_SUFFIX = MONSTER_SAVE_FAILED_EFFECTS_PATH
const REPEAT_SAVE_SUFFIX = MONSTER_SAVE_REPEAT_PATH

function watchPath(namePrefix: string, suffix: string): string {
  return namePrefix ? `${namePrefix}.${suffix}` : suffix
}

export function MonsterActionSaveRepeatAdd({
  namePrefix,
  visible,
  open,
  onAdd,
}: {
  namePrefix: string
  visible: boolean
  open: boolean
  onAdd: () => void
}) {
  if (!visible || open) return null
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onAdd}
      id={`${namePrefix.replaceAll('.', '-')}-repeat-save`}
    >
      {MONSTER_SAVE_REPEAT_ADD_LABEL}
    </Button>
  )
}

export function MonsterActionSaveRepeatRemove({ namePrefix }: { namePrefix: string }) {
  const { setValue } = useFormContext()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const outcomes = readMonsterSaveOutcomes(useWatch({ name: outcomesPath(namePrefix) }))
  const repeatSave = outcomes.find((outcome) => outcome.result === 'failed-save')?.repeatSave
  const clear = () => {
    setValue(
      outcomesPath(namePrefix),
      withMonsterSaveRepeatSave(outcomes, undefined),
      WRITE_OPTIONS,
    )
  }
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          if (repeatSaveRemovalNeedsConfirm(repeatSave)) {
            setConfirmOpen(true)
            return
          }
          clear()
        }}
      >
        Remove
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        headline="Remove repeat save?"
        description="This removes the second failure and any eligibility note."
        confirmLabel="Remove"
        onConfirm={() => {
          setConfirmOpen(false)
          clear()
        }}
      />
    </>
  )
}

export function MonsterActionSaveRepeatSaveField({ namePrefix }: { namePrefix: string }) {
  const { setValue } = useFormContext()
  const outcomes = readMonsterSaveOutcomes(useWatch({ name: outcomesPath(namePrefix) }))
  const failedEffects = useWatch({ name: watchPath(namePrefix, FAILED_EFFECTS_SUFFIX) })
  const repeatSave = useWatch({ name: watchPath(namePrefix, REPEAT_SAVE_SUFFIX) })
  const visible = shouldShowSaveRepeatSaveAuthoring(failedEffects, repeatSave)
  const open = repeatSaveShellIsOpen(repeatSave)

  return (
    <MonsterActionSaveRepeatAdd
      namePrefix={namePrefix}
      visible={visible}
      open={open}
      onAdd={() => {
        if (open) return
        setValue(
          outcomesPath(namePrefix),
          withMonsterSaveRepeatSave(outcomes, defaultRepeatSaveShell()),
          WRITE_OPTIONS,
        )
      }}
    />
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
