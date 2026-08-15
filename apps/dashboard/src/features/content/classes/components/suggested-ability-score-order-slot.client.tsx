'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import {
  resolveClassAbilityScoreOrder,
  type AbilityScoreOrder,
  type StandardArray,
} from '@rpg/contracts'

import type { ClassFormValues } from '../lib/class-form-fields'
import { SortableAbilityScoreOrder } from './sortable-ability-score-order.client'

type SuggestedAbilityScoreOrderSlotProps = {
  standardArray: StandardArray
}

export function SuggestedAbilityScoreOrderSlot({
  standardArray,
}: SuggestedAbilityScoreOrderSlotProps) {
  const form = useFormContext<ClassFormValues>()
  const primaryAbilities = useWatch({ control: form.control, name: 'primaryAbilities' }) ?? []
  const abilityScoreOrder = useWatch({
    control: form.control,
    name: 'characterCreation.abilityScoreOrder',
  }) as AbilityScoreOrder | undefined

  const resolvedOrder = resolveClassAbilityScoreOrder({
    abilityScoreOrder,
    primaryAbilities,
  })

  return (
    <SortableAbilityScoreOrder
      value={resolvedOrder}
      standardArray={standardArray}
      onChange={(next) => {
        form.setValue('characterCreation.abilityScoreOrder', [...next], {
          shouldDirty: true,
          shouldValidate: true,
        })
      }}
    />
  )
}
