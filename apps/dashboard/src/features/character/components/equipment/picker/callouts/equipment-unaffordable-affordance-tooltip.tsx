import { CircleAlert } from 'lucide-react'

import { formatMoney, formatWealthAsGold } from '@rpg/contracts'
import { EmphasisDetailLine, Text } from '@rpg/ui'

import type { EntitySummaryStatusItem } from '@/features/content'

import {
  getEquipmentUnaffordableAmounts,
  type EquipmentUnaffordableAmounts,
} from '../drawer/equipment-picker-drawer.lib'
import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  type EquipmentBudgetSummary,
  type EquipmentPickerItem,
} from '../drawer/equipment-picker-drawer.types'

export function EquipmentUnaffordableAffordanceTooltip({
  amounts,
}: {
  amounts: EquipmentUnaffordableAmounts
}) {
  const need = formatMoney(amounts.required)
  const have = formatWealthAsGold(amounts.remaining)

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

export function enrichEquipmentPickerStatusWithAffordabilityTooltip(
  status: readonly EntitySummaryStatusItem[] | undefined,
  item: EquipmentPickerItem,
  budget?: EquipmentBudgetSummary,
): readonly EntitySummaryStatusItem[] | undefined {
  if (!status?.length) return status

  const amounts = getEquipmentUnaffordableAmounts(item, budget)
  if (!amounts) return status

  return status.map((entry) => {
    if (entry.kind !== 'badge' || entry.label !== EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL) {
      return entry
    }
    return {
      ...entry,
      tooltip: <EquipmentUnaffordableAffordanceTooltip amounts={amounts} />,
    }
  })
}
