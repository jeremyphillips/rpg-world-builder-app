import { Button, ConfirmDialog } from '@rpg/ui'
import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { MONSTER_SAVE_REPEAT_ADD_LABEL } from '../../monster-form-labels'
import {
  readMonsterSaveOutcomes,
  repeatSaveRemovalNeedsConfirm,
  saveOutcomesPath,
  withMonsterSaveRepeatSave,
} from './monster-action-save-outcomes'
import { MONSTER_FORM_WRITE_OPTIONS } from '../../monster-form-write-options'

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
  const outcomes = readMonsterSaveOutcomes(useWatch({ name: saveOutcomesPath(namePrefix) }))
  const repeatSave = outcomes.find((outcome) => outcome.result === 'failed-save')?.repeatSave
  const clear = () => {
    setValue(
      saveOutcomesPath(namePrefix),
      withMonsterSaveRepeatSave(outcomes, undefined),
      MONSTER_FORM_WRITE_OPTIONS,
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
