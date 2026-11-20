import { NumberStepper, OptionalFieldDisclosure } from '@rpg/ui'
import {
  optionalDisclosureShellProps,
  resolveOptionalDisclosureActions,
  useFieldControlSize,
} from '@rpg/ui/form'
import { useFormContext, useWatch, useController } from 'react-hook-form'

import {
  MONSTER_MULTIATTACK_ADD_REPETITION_LABEL,
  MONSTER_MULTIATTACK_REMOVE_REPETITION_LABEL,
  MONSTER_MULTIATTACK_TIMES_LABEL,
} from '../../../../lib/monster-form-labels'
import { MONSTER_FORM_WRITE_OPTIONS } from '../../../../lib/monster-form-write-options'
import { multiattackRepetitionDisclosureOpen } from '../../../../lib/actions/multiattack/monster-multiattack-repetition.lib'
import type { MonsterActionDraftRow } from '../../../../lib/actions/monster-action-presets'
import {
  multiattackActionKindById,
  multiattackSectionRowsPathFromStepPrefix,
  multiattackUseStepRepetitionAddVisible,
  multiattackUseStepRepetitionSlotVisible,
} from '../../../../lib/actions/multiattack/monster-multiattack-use-repetition.lib'
import { multiattackTimesStepperBinding } from '../../../../lib/actions/multiattack/monster-multiattack-times-stepper.lib'

export function MonsterMultiattackUseStepRepetitionSlot({
  namePrefix,
  fallbackActionRows,
}: {
  namePrefix?: string
  fallbackActionRows?: readonly MonsterActionDraftRow[]
}) {
  if (!namePrefix) return null
  return (
    <MonsterMultiattackUseStepRepetitionSlotBound
      namePrefix={namePrefix}
      fallbackActionRows={fallbackActionRows}
    />
  )
}

function MonsterMultiattackUseStepRepetitionSlotBound({
  namePrefix,
  fallbackActionRows,
}: {
  namePrefix: string
  fallbackActionRows?: readonly MonsterActionDraftRow[]
}) {
  const controlSize = useFieldControlSize()
  const { setValue, control } = useFormContext()

  const step = (useWatch({ name: namePrefix }) ?? {}) as Record<string, unknown>
  const mode = step.mode
  const isSingle = mode !== 'choice' && !(Array.isArray(step.choices) && step.choices.length > 0)

  const sectionRowsPath = multiattackSectionRowsPathFromStepPrefix(namePrefix)
  const liveActionRows = useWatch({ name: sectionRowsPath }) as MonsterActionDraftRow[] | undefined
  const actionRows =
    liveActionRows && liveActionRows.length > 0 ? liveActionRows : (fallbackActionRows ?? [])
  const actionId = typeof step.actionId === 'string' ? step.actionId : undefined
  const actionKind = multiattackActionKindById(actionId, actionRows)

  const countName = `${namePrefix}.count`
  const count = useWatch({ name: countName })
  const slotVisible = isSingle && multiattackUseStepRepetitionSlotVisible({ actionKind, count })

  const addVisible = multiattackUseStepRepetitionAddVisible(actionKind)
  const { field: countField } = useController({
    name: countName,
    control,
    shouldUnregister: false,
  })

  if (!slotVisible) return null

  const repetitionOpen = multiattackRepetitionDisclosureOpen(count)
  const repetitionActions = resolveOptionalDisclosureActions({
    intent: 'add',
    subject: 'repetition',
    addLabel: MONSTER_MULTIATTACK_ADD_REPETITION_LABEL,
    removeLabel: MONSTER_MULTIATTACK_REMOVE_REPETITION_LABEL,
  })
  const repetitionFieldId = `${namePrefix.replaceAll('.', '-')}-times`

  return (
    <OptionalFieldDisclosure
      controlId={repetitionFieldId}
      fieldLabel={MONSTER_MULTIATTACK_TIMES_LABEL}
      {...optionalDisclosureShellProps(repetitionActions)}
      open={repetitionOpen}
      onOpenChange={(next) => {
        if (!addVisible) return
        if (next && !repetitionOpen) {
          setValue(countName, 2, MONSTER_FORM_WRITE_OPTIONS)
        }
      }}
      onRemove={() => setValue(countName, undefined, MONSTER_FORM_WRITE_OPTIONS)}
      size={controlSize}
      addDisabled={repetitionOpen || !addVisible}
    >
      <NumberStepper
        id={repetitionFieldId}
        stepperLabel={MONSTER_MULTIATTACK_TIMES_LABEL}
        aria-label={MONSTER_MULTIATTACK_TIMES_LABEL}
        size={controlSize}
        digits={2}
        min={1}
        step={1}
        emptySeed={2}
        {...multiattackTimesStepperBinding(countField.value)}
        onChange={(next) => setValue(countName, next, MONSTER_FORM_WRITE_OPTIONS)}
        onBlur={countField.onBlur}
      />
    </OptionalFieldDisclosure>
  )
}
