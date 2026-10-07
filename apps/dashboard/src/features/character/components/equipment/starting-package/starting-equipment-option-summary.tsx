import type { ReactNode } from 'react'

import type { StartingEquipmentOptionSummary } from '@rpg/contracts'
import {
  Badge,
  SelectionOptionCard,
  SelectionOptionCardHeaderAction,
  type SelectionOptionCardDensity,
} from '@rpg/ui'

import {
  EQUIPMENT_CHANGE_PACKAGE_LABEL,
  EQUIPMENT_SELECTED_PACKAGE_EYEBROW,
  formatStartingEquipmentTierContribution,
} from '../../../lib/equipment/equipment-step.lib'

import {
  startingEquipmentTierContributionBaseVariants,
  startingEquipmentTierContributionRowVariants,
} from './starting-equipment-option-cards.variants'

export type StartingEquipmentOptionSummaryCardProps = {
  summary: StartingEquipmentOptionSummary
  density: SelectionOptionCardDensity
  onChangePackage: () => void
  showChangePackage?: boolean
  titleAdornment?: ReactNode
  /** Replaces the default Change package action when provided. */
  headerEndSlot?: ReactNode
  description?: string
  /** Owned-equipment advisory sentences for this package. */
  advisoryLabels?: readonly string[]
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
  advisoryLabels = [],
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
  const tierContribution = formatStartingEquipmentTierContribution(summary)

  return (
    <SelectionOptionCard
      selected
      density={density}
      headerEyebrow={EQUIPMENT_SELECTED_PACKAGE_EYEBROW}
      headerEndSlot={headerEndSlot === undefined ? defaultHeaderEndSlot : headerEndSlot}
      label={summary.label}
      titleAdornment={titleAdornment}
      description={description ?? summary.description}
      summaryContent={
        tierContribution ? (
          <div className={startingEquipmentTierContributionRowVariants()}>
            {tierContribution.baseLabel ? (
              <span className={startingEquipmentTierContributionBaseVariants({ density })}>
                {tierContribution.baseLabel}
              </span>
            ) : null}
            <Badge appearance="soft" tone="neutral" size="md">
              {tierContribution.badgeLabel}
            </Badge>
          </div>
        ) : undefined
      }
      summaryLines={[...advisoryLabels]}
      embedded={embedded}
      {...(embeddedTone ? { embeddedTone } : {})}
    />
  )
}
