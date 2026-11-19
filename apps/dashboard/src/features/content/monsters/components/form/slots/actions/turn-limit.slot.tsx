import { OptionalFieldDisclosure, Text } from '@rpg/ui'
import {
  optionalDisclosureShellProps,
  resolveOptionalDisclosureActions,
  useFieldControlSize,
} from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  MONSTER_TURN_LIMIT_LABEL,
  MONSTER_TURN_LIMIT_OPTION_LABEL,
} from '../../../../lib/monster-form-labels'

const WRITE_OPTIONS = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const

export function MonsterActionTurnLimitControl({ name }: { name: string }) {
  const controlSize = useFieldControlSize()
  const { setValue } = useFormContext()
  const enabled = useWatch({ name }) === true
  const fieldId = `${name.replaceAll('.', '-')}-turn-limit`
  const actions = resolveOptionalDisclosureActions({
    intent: 'add',
    subject: 'turn limit',
  })

  return (
    <OptionalFieldDisclosure
      controlId={fieldId}
      fieldLabel={MONSTER_TURN_LIMIT_LABEL}
      {...optionalDisclosureShellProps(actions)}
      open={enabled}
      onOpenChange={(next) => {
        if (next) setValue(name as never, true as never, WRITE_OPTIONS)
      }}
      onRemove={() => setValue(name as never, undefined as never, WRITE_OPTIONS)}
      size={controlSize}
    >
      <Text as="p" variant="caption">
        {MONSTER_TURN_LIMIT_OPTION_LABEL}
      </Text>
    </OptionalFieldDisclosure>
  )
}
