import type { ReactNode } from 'react'

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
  titleAdornment?: ReactNode
  /** Replaces the default Change package action when provided. */
  headerEndSlot?: ReactNode
  description?: string
  embedded?: ReactNode
  embeddedTone?: 'divider' | 'panel'
}

export function StartingEquipmentOptionSummaryCard({
  summary,
  density,
  onChangePackage,
  showChangePackage = true,
  titleAdornment,
  headerEndSlot,
  description,
  embedded,
  embeddedTone,
}: StartingEquipmentOptionSummaryCardProps) {
  const defaultHeaderEndSlot = showChangePackage ? (
    <SelectionOptionCardHeaderAction
      label={EQUIPMENT_CHANGE_PACKAGE_LABEL}
      density={density}
      onClick={onChangePackage}
    />
  ) : undefined

  return (
    <SelectionOptionCard
      selected
      density={density}
      headerEyebrow={EQUIPMENT_SELECTED_PACKAGE_EYEBROW}
      headerEndSlot={headerEndSlot === undefined ? defaultHeaderEndSlot : headerEndSlot}
      label={summary.label}
      titleAdornment={titleAdornment}
      description={description ?? summary.description}
      summaryLines={startingEquipmentOptionFundingSummaryLines(summary)}
      embedded={embedded}
      {...(embeddedTone ? { embeddedTone } : {})}
    />
  )
}
