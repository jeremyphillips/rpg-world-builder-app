import type { StartingEquipmentOptionSummary } from '@rpg/contracts'
import { Eyebrow, SelectionOptionCard, SelectionOptionCardHeaderAction } from '@rpg/ui'

import {
  EQUIPMENT_CHANGE_PACKAGE_LABEL,
  EQUIPMENT_SELECTED_PACKAGE_EYEBROW,
  startingEquipmentOptionFundingSummaryLines,
} from '../../../lib/equipment/equipment-step.lib'

export type StartingEquipmentOptionSummaryCardProps = {
  summary: StartingEquipmentOptionSummary
  onChangePackage: () => void
}

export function StartingEquipmentOptionSummaryCard({
  summary,
  onChangePackage,
}: StartingEquipmentOptionSummaryCardProps) {
  return (
    <SelectionOptionCard
      selected
      headerStartSlot={<Eyebrow>{EQUIPMENT_SELECTED_PACKAGE_EYEBROW}</Eyebrow>}
      headerEndSlot={
        <SelectionOptionCardHeaderAction
          label={EQUIPMENT_CHANGE_PACKAGE_LABEL}
          onClick={onChangePackage}
        />
      }
      label={summary.label}
      description={summary.description}
      summaryLines={startingEquipmentOptionFundingSummaryLines(summary)}
    />
  )
}
