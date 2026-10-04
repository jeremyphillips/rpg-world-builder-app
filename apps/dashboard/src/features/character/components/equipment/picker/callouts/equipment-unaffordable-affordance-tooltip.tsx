import { CircleAlert } from 'lucide-react'

import { formatMoney } from '@rpg/contracts'
import { EmphasisDetailLine, Text } from '@rpg/ui'

import { formatEquipmentResourceWealth } from '../../acquisition/equipment-acquisition-guidance.lib'
import type { EquipmentUnaffordableAmounts } from '../drawer/equipment-picker-drawer.lib'

export function EquipmentUnaffordableAffordanceTooltip({
  amounts,
}: {
  amounts: EquipmentUnaffordableAmounts
}) {
  const need = formatMoney(amounts.required)
  const have = formatEquipmentResourceWealth(amounts.remaining)

  return (
    <Text as="span" variant="warning" className="flex items-start gap-1.5 text-xs">
      <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <EmphasisDetailLine
        primary={`${need} needed`}
        primaryTone="warning"
        secondary={`${have} remaining`}
        secondaryTone="disabled"
      />
    </Text>
  )
}
