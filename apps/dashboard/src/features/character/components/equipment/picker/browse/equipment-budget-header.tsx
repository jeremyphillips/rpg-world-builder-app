import { formatWealthAsGold, type EquipmentBudgetSummary } from '@rpg/contracts'
import { InlineMetadata, Text } from '@rpg/ui'

import {
  equipmentBudgetHeaderMetaClasses,
  equipmentBudgetHeaderPanelClasses,
  equipmentBudgetHeaderRemainingClasses,
} from './equipment-budget-header.variants'

export type EquipmentBudgetHeaderProps = {
  budget: EquipmentBudgetSummary
}

export function EquipmentBudgetHeader({ budget }: EquipmentBudgetHeaderProps) {
  return (
    <div className={equipmentBudgetHeaderPanelClasses}>
      <Text as="p" className={equipmentBudgetHeaderRemainingClasses}>
        {formatWealthAsGold(budget.remaining)} remaining
      </Text>
      <Text as="p" className={equipmentBudgetHeaderMetaClasses}>
        <InlineMetadata role="supporting" density="compact">
          <InlineMetadata.Item>{formatWealthAsGold(budget.starting)} starting</InlineMetadata.Item>
          <InlineMetadata.Item>{formatWealthAsGold(budget.spent)} spent</InlineMetadata.Item>
        </InlineMetadata>
      </Text>
    </div>
  )
}
