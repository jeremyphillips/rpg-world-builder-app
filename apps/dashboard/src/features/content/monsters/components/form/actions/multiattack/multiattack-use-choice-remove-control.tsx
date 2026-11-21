import { ArrayItemRemoveButton, useArrayFieldContext } from '@rpg/ui/form'
import { useFormContext } from 'react-hook-form'

import { MONSTER_FORM_WRITE_OPTIONS } from '../../../../lib/monster-form-write-options'
import { multiattackUseChoiceRemovePlan } from '../../../../lib/actions/multiattack/monster-multiattack-use-choice.lib'

export function MonsterMultiattackUseChoiceRemoveControl() {
  const arrayContext = useArrayFieldContext()
  const { getValues, setValue } = useFormContext()

  if (!arrayContext?.fullArrayName || !arrayContext.removeItem) return null

  const parentPath = arrayContext.fullArrayName.replace(/\.choices$/, '')
  const parentStep = (getValues(parentPath) ?? {}) as Record<string, unknown>
  const removedIndex = arrayContext.rowIndex
  const plan = multiattackUseChoiceRemovePlan(parentStep, removedIndex)

  return (
    <ArrayItemRemoveButton
      ariaLabel="Remove choice"
      canRemove
      onRemove={() => {
        if (plan.mode === 'filter') {
          setValue(`${parentPath}.choices`, plan.choices, MONSTER_FORM_WRITE_OPTIONS)
          return
        }
        setValue(parentPath, plan.parent, MONSTER_FORM_WRITE_OPTIONS)
      }}
    />
  )
}
