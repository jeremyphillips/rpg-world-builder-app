import { BooleanField } from '@rpg/ui'
import { useFormContext, useWatch } from 'react-hook-form'

import type { MonsterFormValues } from '../../lib/monster-form-values'
import { waterBreathingDurationEnabled } from '../../lib/monster-trait-preset-fields'

const WATER_BREATHING_TOGGLE_LABEL = 'Hold breath outside water'

export function WaterBreathingToggle({ namePrefix }: { namePrefix: string }) {
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
