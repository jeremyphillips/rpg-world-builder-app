'use client'

import type { StartingEquipmentOptionSummary } from '@rpg/contracts'
import { Button, Eyebrow, Text, cn } from '@rpg/ui'

import {
  EQUIPMENT_CHANGE_PACKAGE_LABEL,
  EQUIPMENT_SELECTED_PACKAGE_EYEBROW,
} from '../../lib/equipment-step.lib'
import {
  startingEquipmentOptionCardSelectedShellClasses,
  startingEquipmentOptionCardShellClasses,
} from './starting-equipment-option-cards.variants'
import {
  startingEquipmentOptionSummaryActionsClasses,
  startingEquipmentOptionSummaryBodyClasses,
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
        <Eyebrow>{EQUIPMENT_SELECTED_PACKAGE_EYEBROW}</Eyebrow>
        <Text as="h3" className={startingEquipmentOptionSummaryTitleClasses}>
          {summary.label}
        </Text>
        {summary.description ? <Text variant="muted">{summary.description}</Text> : null}
      </div>
      <div className={startingEquipmentOptionSummaryActionsClasses}>
        <Button type="button" variant="secondary" size="sm" onClick={onChangePackage}>
          {EQUIPMENT_CHANGE_PACKAGE_LABEL}
        </Button>
      </div>
    </article>
  )
}
