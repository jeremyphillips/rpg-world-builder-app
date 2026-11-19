import { useFormContext, useWatch } from 'react-hook-form'

import { MonsterActionSaveRepeatAdd } from '../../../../lib/actions/save/monster-action-save-repeat-controls'
import {
  defaultRepeatSaveShell,
  MONSTER_SAVE_FAILED_EFFECTS_PATH,
  MONSTER_SAVE_REPEAT_PATH,
  readMonsterSaveOutcomes,
  repeatSaveShellIsOpen,
  saveOutcomesPath,
  saveWatchPath,
  shouldShowSaveRepeatSaveAuthoring,
  withMonsterSaveRepeatSave,
} from '../../../../lib/actions/save/monster-action-save-outcomes'
import { MONSTER_FORM_WRITE_OPTIONS } from '../../../../lib/monster-form-write-options'

export function MonsterActionSaveRepeatSaveField({ namePrefix }: { namePrefix: string }) {
  const { setValue } = useFormContext()
  const outcomes = readMonsterSaveOutcomes(useWatch({ name: saveOutcomesPath(namePrefix) }))
  const failedEffects = useWatch({
    name: saveWatchPath(namePrefix, MONSTER_SAVE_FAILED_EFFECTS_PATH),
  })
  const repeatSave = useWatch({ name: saveWatchPath(namePrefix, MONSTER_SAVE_REPEAT_PATH) })
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
          saveOutcomesPath(namePrefix),
          withMonsterSaveRepeatSave(outcomes, defaultRepeatSaveShell()),
          MONSTER_FORM_WRITE_OPTIONS,
        )
      }}
    />
  )
}
