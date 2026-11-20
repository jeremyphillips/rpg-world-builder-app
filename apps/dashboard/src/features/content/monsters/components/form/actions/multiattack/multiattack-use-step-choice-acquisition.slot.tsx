import { ActionButton, resolveAttachedButtonSize } from '@rpg/ui'
import { useFieldControlSize } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import { MONSTER_MULTIATTACK_ADD_ACTION_CHOICE_LABEL } from '../../../../lib/monster-form-labels'
import { MONSTER_FORM_WRITE_OPTIONS } from '../../../../lib/monster-form-write-options'
import {
  multiattackExpandUseToChoicePayload,
  multiattackUseChoiceAcquisitionVisible,
} from '../../../../lib/actions/multiattack/monster-multiattack-use-choice.lib'

export function MonsterMultiattackUseStepChoiceAcquisitionSlot({
  namePrefix,
}: {
  namePrefix?: string
}) {
  const controlSize = useFieldControlSize()
  const { setValue } = useFormContext()
  if (!namePrefix) return null

  const step = (useWatch({ name: namePrefix }) ?? {}) as Record<string, unknown>
  const mode = step.mode
  const isSingle = mode !== 'choice' && !(Array.isArray(step.choices) && step.choices.length > 0)
  if (!isSingle) return null
  if (!multiattackUseChoiceAcquisitionVisible(step)) return null

  return (
    <ActionButton
      action="add"
      type="button"
      variant="text"
      size={resolveAttachedButtonSize(controlSize)}
      className="self-start"
      onClick={() => {
        setValue(namePrefix, multiattackExpandUseToChoicePayload(step), MONSTER_FORM_WRITE_OPTIONS)
      }}
    >
      {MONSTER_MULTIATTACK_ADD_ACTION_CHOICE_LABEL}
    </ActionButton>
  )
}
