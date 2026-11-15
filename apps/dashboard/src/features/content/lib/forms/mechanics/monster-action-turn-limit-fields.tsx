'use client'

import { OptionalFieldDisclosure, Text } from '@rpg/ui'
import type { FormItem } from '@rpg/ui/form'
import { useFieldControlSize } from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  MONSTER_TURN_LIMIT_ADD_LABEL,
  MONSTER_TURN_LIMIT_LABEL,
  MONSTER_TURN_LIMIT_OPTION_LABEL,
} from '../../../monsters/lib/monster-form-labels'

const WRITE_OPTIONS = { shouldDirty: true, shouldTouch: true, shouldValidate: true } as const

function MonsterActionTurnLimitControl({ name }: { name: string }) {
  const controlSize = useFieldControlSize()
  const { setValue } = useFormContext()
  const enabled = useWatch({ name }) === true
  const fieldId = `${name.replaceAll('.', '-')}-turn-limit`

  return (
    <OptionalFieldDisclosure
      controlId={fieldId}
      fieldLabel={MONSTER_TURN_LIMIT_LABEL}
      addLabel={MONSTER_TURN_LIMIT_ADD_LABEL}
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

export function monsterActionTurnLimitField(name = 'onceUntilNextTurn'): FormItem {
  return {
    kind: 'slot',
    name: '_turnLimit',
    render: () => <MonsterActionTurnLimitControl name={name} />,
  }
}
