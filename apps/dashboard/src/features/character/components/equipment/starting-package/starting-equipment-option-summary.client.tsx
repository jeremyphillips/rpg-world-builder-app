'use client'

import type { StartingEquipmentOptionSummary } from '@rpg/contracts'
import { Button, Eyebrow, Text, cn } from '@rpg/ui'

import {
  EQUIPMENT_CHANGE_PACKAGE_LABEL,
  EQUIPMENT_SELECTED_PACKAGE_EYEBROW,
  startingEquipmentOptionFundingSummaryLines,
} from '../../../lib/equipment/equipment-step.lib'
import {
  startingEquipmentOptionCardSelectedShellClasses,
  startingEquipmentOptionCardShellClasses,
} from './starting-equipment-option-cards.variants'
import {
  startingEquipmentOptionSummaryBodyClasses,
  startingEquipmentOptionSummaryChangePackageLinkClasses,
  startingEquipmentOptionSummaryDescriptionClasses,
  startingEquipmentOptionSummaryEyebrowRowClasses,
  startingEquipmentOptionSummaryFundingLineClasses,
  startingEquipmentOptionSummaryTitleClasses,
} from './starting-equipment-option-summary.variants'

export type StartingEquipmentOptionSummaryCardProps = {
  summary: StartingEquipmentOptionSummary
  onChangePackage: () => void
}

export function StartingEquipmentOptionSummaryCard({
  summary,
  onChangePackage,
}: StartingEquipmentOptionSummaryCardProps) {
  return (
    <article
      className={cn(
        startingEquipmentOptionCardShellClasses,
        startingEquipmentOptionCardSelectedShellClasses,
      )}
    >
      <div className={startingEquipmentOptionSummaryBodyClasses}>
        <div className={startingEquipmentOptionSummaryEyebrowRowClasses}>
          <Eyebrow>{EQUIPMENT_SELECTED_PACKAGE_EYEBROW}</Eyebrow>
          <Button
            type="button"
            variant="link"
            size="sm"
            className={startingEquipmentOptionSummaryChangePackageLinkClasses}
            onClick={onChangePackage}
          >
            {EQUIPMENT_CHANGE_PACKAGE_LABEL}
          </Button>
        </div>
        <Text as="h3" className={startingEquipmentOptionSummaryTitleClasses}>
          {summary.label}
        </Text>
        {summary.description ? (
          <Text as="p" className={startingEquipmentOptionSummaryDescriptionClasses}>
            {summary.description}
          </Text>
        ) : null}
        {startingEquipmentOptionFundingSummaryLines(summary).map((line) => (
          <Text key={line} as="p" className={startingEquipmentOptionSummaryFundingLineClasses}>
            {line}
          </Text>
        ))}
      </div>
    </article>
  )
}
