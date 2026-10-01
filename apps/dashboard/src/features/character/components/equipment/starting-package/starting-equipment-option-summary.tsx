import type { StartingEquipmentOptionSummary } from '@rpg/contracts'
import {
  SelectionOptionCard,
  SelectionOptionCardHeaderAction,
  type SelectionOptionCardDensity,
} from '@rpg/ui'

import {
  EQUIPMENT_CHANGE_PACKAGE_LABEL,
  EQUIPMENT_SELECTED_PACKAGE_EYEBROW,
  startingEquipmentOptionFundingSummaryLines,
} from '../../../lib/equipment/equipment-step.lib'

export type StartingEquipmentOptionSummaryCardProps = {
  summary: StartingEquipmentOptionSummary
  density: SelectionOptionCardDensity
  onChangePackage: () => void
  showChangePackage?: boolean
}

export function StartingEquipmentOptionSummaryCard({
  summary,
  density,
  onChangePackage,
  showChangePackage = true,
}: StartingEquipmentOptionSummaryCardProps) {
  return (
    <SelectionOptionCard
      selected
      density={density}
      headerEyebrow={EQUIPMENT_SELECTED_PACKAGE_EYEBROW}
      headerEndSlot={
        showChangePackage ? (
          <SelectionOptionCardHeaderAction
            label={EQUIPMENT_CHANGE_PACKAGE_LABEL}
            onClick={onChangePackage}
          />
        ) : undefined
      }
      label={summary.label}
      description={summary.description}
      summaryLines={startingEquipmentOptionFundingSummaryLines(summary)}
    />
  )
}
