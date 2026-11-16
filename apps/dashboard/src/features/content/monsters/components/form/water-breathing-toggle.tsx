import { useContext } from 'react'
import { BooleanField } from '@rpg/ui'
import { useFormContext, useWatch } from 'react-hook-form'

import { MasterDetailRowPrefixContext } from '../../../lib/master-detail/use-master-detail-row-prefix'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { waterBreathingDurationEnabled } from '../../lib/traits/monster-trait-preset-fields'

const WATER_BREATHING_TOGGLE_LABEL = 'Hold breath outside water'

export function WaterBreathingToggle({ namePrefix: namePrefixProp }: { namePrefix?: string }) {
  const rowPrefix = useContext(MasterDetailRowPrefixContext)
  const namePrefix = namePrefixProp ?? rowPrefix
  if (!namePrefix) {
    throw new Error('WaterBreathingToggle requires namePrefix or MasterDetailRowPrefixProvider')
  }
  const form = useFormContext<MonsterFormValues>()
  const amount = useWatch({ name: `${namePrefix}.outsideWaterBreathAmount` as never })
  const unit = useWatch({ name: `${namePrefix}.outsideWaterBreathUnit` as never })
  const enabled = waterBreathingDurationEnabled({
    outsideWaterBreathAmount: amount,
    outsideWaterBreathUnit: unit,
  })

  return (
    <BooleanField
      label={WATER_BREATHING_TOGGLE_LABEL}
      checked={enabled}
      onCheckedChange={(checked) => {
        const current = form.getValues(namePrefix as never) as Record<string, unknown>
        if (checked) {
          form.setValue(
            namePrefix as never,
            {
              ...current,
              outsideWaterBreathAmount: 1,
              outsideWaterBreathUnit: 'hour',
            } as never,
            { shouldDirty: true },
          )
          return
        }
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
