import type { EntitySummaryStatusItem } from '@/features/content'

import { getEquipmentUnaffordableAmounts } from '../drawer/equipment-picker-drawer.lib'
import {
  EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL,
  type EquipmentBudgetSummary,
  type EquipmentPickerItem,
} from '../drawer/equipment-picker-drawer.types'
import { EquipmentUnaffordableAffordanceTooltip } from './equipment-unaffordable-affordance-tooltip'

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
