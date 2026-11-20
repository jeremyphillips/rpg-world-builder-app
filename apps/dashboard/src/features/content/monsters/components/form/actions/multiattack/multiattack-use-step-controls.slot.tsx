import { Button, NumberField, OptionalFieldDisclosure, Text } from '@rpg/ui'
import {
  optionalDisclosureShellProps,
  resolveOptionalDisclosureActions,
  useFieldControlSize,
} from '@rpg/ui/form'
import { useFormContext, useWatch, useController } from 'react-hook-form'

import {
  MONSTER_MULTIATTACK_ADD_ACTION_CHOICE_LABEL,
  MONSTER_MULTIATTACK_ADD_REPETITION_LABEL,
  MONSTER_MULTIATTACK_REMOVE_REPETITION_LABEL,
  MONSTER_MULTIATTACK_TIMES_LABEL,
} from '../../../../lib/monster-form-labels'
import { MONSTER_FORM_WRITE_OPTIONS } from '../../../../lib/monster-form-write-options'
import {
  multiattackExpandUseToChoicePayload,
  multiattackUseChoiceExpandBlocked,
} from '../../../../lib/actions/multiattack/monster-multiattack-use-choice.lib'
import { multiattackRepetitionDisclosureOpen } from '../../../../lib/actions/multiattack/monster-multiattack-repetition.lib'

export function MonsterMultiattackUseStepControlsSlot({ namePrefix }: { namePrefix?: string }) {
  const controlSize = useFieldControlSize()
  const { setValue, control } = useFormContext()
  if (!namePrefix) return null

  const step = (useWatch({ name: namePrefix }) ?? {}) as Record<string, unknown>
  const mode = step.mode
  const isSingle = mode !== 'choice' && !(Array.isArray(step.choices) && step.choices.length > 0)
  if (!isSingle) return null

  const countName = `${namePrefix}.count`
  const count = useWatch({ name: countName })
  const { field: countField } = useController({
    name: countName,
    control,
    shouldUnregister: false,
  })

  const repetitionOpen = multiattackRepetitionDisclosureOpen(count)
  const repetitionActions = resolveOptionalDisclosureActions({
    intent: 'add',
    subject: 'repetition',
    addLabel: MONSTER_MULTIATTACK_ADD_REPETITION_LABEL,
    removeLabel: MONSTER_MULTIATTACK_REMOVE_REPETITION_LABEL,
  })
  const repetitionFieldId = `${namePrefix.replaceAll('.', '-')}-times`

  const choiceGuard = multiattackUseChoiceExpandBlocked(step)
  const choiceDisabled = choiceGuard.disabled

  return (
    <>
      <OptionalFieldDisclosure
        controlId={repetitionFieldId}
        fieldLabel={MONSTER_MULTIATTACK_TIMES_LABEL}
        {...optionalDisclosureShellProps(repetitionActions)}
        open={repetitionOpen}
        onOpenChange={(next) => {
          if (next && !repetitionOpen) {
            setValue(countName, 2, MONSTER_FORM_WRITE_OPTIONS)
          }
        }}
        onRemove={() => setValue(countName, undefined, MONSTER_FORM_WRITE_OPTIONS)}
        size={controlSize}
        addDisabled={repetitionOpen}
      >
        <NumberField
          id={repetitionFieldId}
          label={MONSTER_MULTIATTACK_TIMES_LABEL}
          labelVisibility="srOnly"
          size={controlSize}
          digits={2}
          min={1}
          step={1}
          value={countField.value ?? ''}
          onChange={(event) => {
            const raw = event.target.value
            if (raw === '') {
              setValue(countName, undefined, MONSTER_FORM_WRITE_OPTIONS)
              return
            }
            const parsed = Number(raw)
            if (Number.isInteger(parsed) && parsed >= 1) {
              setValue(countName, parsed, MONSTER_FORM_WRITE_OPTIONS)
            } else {
              setValue(countName, raw as never, MONSTER_FORM_WRITE_OPTIONS)
            }
          }}
        />
      </OptionalFieldDisclosure>
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="link"
          size={controlSize}
          disabled={choiceDisabled}
          onClick={() => {
            if (choiceDisabled) return
            setValue(
              namePrefix,
              multiattackExpandUseToChoicePayload(step),
              MONSTER_FORM_WRITE_OPTIONS,
            )
          }}
        >
          {MONSTER_MULTIATTACK_ADD_ACTION_CHOICE_LABEL}
        </Button>
        {choiceGuard.captions.map((caption) => (
          <Text key={caption} as="p" variant="caption" className="text-muted">
            {caption}
          </Text>
        ))}
      </div>
    </>
  )
}
