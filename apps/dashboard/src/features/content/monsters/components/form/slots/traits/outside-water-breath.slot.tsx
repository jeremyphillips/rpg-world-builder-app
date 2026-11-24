import type { CreatureTraitDurationUnit } from '@rpg/contracts'
import { useContext } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { OutsideWaterBreathToggle } from '@/features/content/lib/creature-traits/outside-water-breath-toggle'
import { outsideWaterBreathDurationEnabled } from '@/features/content/lib/creature-traits/outside-water-breath.lib'

import { MasterDetailRowPrefixContext } from '../../../../../lib/master-detail/use-master-detail-row-prefix'
import type { MonsterFormValues } from '../../../../lib/monster-form-values'

export function OutsideWaterBreathSlot({ namePrefix: namePrefixProp }: { namePrefix?: string }) {
  const rowPrefix = useContext(MasterDetailRowPrefixContext)
  const namePrefix = namePrefixProp ?? rowPrefix
  if (!namePrefix) {
    throw new Error('OutsideWaterBreathSlot requires namePrefix or MasterDetailRowPrefixProvider')
  }
  const form = useFormContext<MonsterFormValues>()
  const amount = useWatch({ name: `${namePrefix}.outsideWaterBreathAmount` as never })
  const unit = useWatch({ name: `${namePrefix}.outsideWaterBreathUnit` as never })
  const enabled = outsideWaterBreathDurationEnabled({
    outsideWaterBreathAmount: amount as unknown as number | undefined,
    outsideWaterBreathUnit: unit as unknown as CreatureTraitDurationUnit | undefined,
  })

  return (
    <OutsideWaterBreathToggle
      enabled={enabled}
      onEnable={() => {
        const current = form.getValues(namePrefix as never) as Record<string, unknown>
        form.setValue(
          namePrefix as never,
          {
            ...current,
            outsideWaterBreathAmount: 1,
            outsideWaterBreathUnit: 'hour',
          } as never,
          { shouldDirty: true },
        )
      }}
      onDisable={() => {
        const current = form.getValues(namePrefix as never) as Record<string, unknown>
        const {
          outsideWaterBreathAmount: _amount,
          outsideWaterBreathUnit: _unit,
          ...rest
        } = current
        form.setValue(namePrefix as never, rest as never, { shouldDirty: true })
      }}
    />
  )
}
