import { NumberField, OptionalFieldDisclosure } from '@rpg/ui'
import {
  optionalDisclosureShellProps,
  resolveOptionalDisclosureActions,
  useFieldControlSize,
} from '@rpg/ui/form'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  MONSTER_LIMIT_RECHARGES_ON_LABEL,
  monsterLimitRechargesOnHint,
} from '../../../../lib/monster-form-labels'
import { MONSTER_FORM_WRITE_OPTIONS } from '../../../../lib/monster-form-write-options'
import {
  completeRecharge,
  MONSTER_RECHARGE_SEED,
  rechargeValueFromRaw,
} from '../../../../lib/actions/recharge/monster-action-recharge'

export function MonsterActionRechargeField({
  name,
  presentation,
}: {
  name: string
  presentation: 'included' | 'optional'
}) {
  const controlSize = useFieldControlSize()
  const { setValue } = useFormContext()
  const current = useWatch({ name })
  const recharge = completeRecharge(current)
  const open = presentation === 'included' || recharge !== undefined
  const fieldId = `${name.replaceAll('.', '-')}-min-roll`
  const actions = resolveOptionalDisclosureActions({
    intent: 'add',
    subject: 'recharge',
    removeLabel: `Remove ${MONSTER_LIMIT_RECHARGES_ON_LABEL}`,
  })

  const write = (next: ReturnType<typeof rechargeValueFromRaw>) => {
    if (next === 'unchanged') return
    setValue(name as never, next as never, MONSTER_FORM_WRITE_OPTIONS)
    if (!next) return
    // A merged write would keep count and recovery from a previous uses value.
    setValue(`${name}.count` as never, undefined as never, MONSTER_FORM_WRITE_OPTIONS)
    setValue(`${name}.recovery` as never, undefined as never, MONSTER_FORM_WRITE_OPTIONS)
  }

  return (
    <OptionalFieldDisclosure
      controlId={fieldId}
      fieldLabel={MONSTER_LIMIT_RECHARGES_ON_LABEL}
      {...optionalDisclosureShellProps(actions)}
      open={open}
      onOpenChange={(next) => {
        if (next && !recharge) write(MONSTER_RECHARGE_SEED)
      }}
      onRemove={() => write(undefined)}
      size={controlSize}
    >
      <NumberField
        id={fieldId}
        label={MONSTER_LIMIT_RECHARGES_ON_LABEL}
        labelVisibility="srOnly"
        hint={monsterLimitRechargesOnHint(recharge?.minRoll)}
        size={controlSize}
        digits={2}
        value={recharge?.minRoll ?? ''}
        onChange={(event) => {
          write(rechargeValueFromRaw(event.target.value))
        }}
      />
    </OptionalFieldDisclosure>
  )
}
