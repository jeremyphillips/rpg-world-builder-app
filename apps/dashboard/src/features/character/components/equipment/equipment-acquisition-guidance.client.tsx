'use client'

import type { EquipmentBudgetSummary, MagicItemGrantProgress } from '@rpg/contracts'
import { getMagicItemRarityLabel } from '@rpg/contracts'
import { Badge, Button, Heading, Text } from '@rpg/ui'

import {
  EQUIPMENT_MAGIC_ITEMS_CHOOSE_LABEL,
  EQUIPMENT_MAGIC_ITEMS_PROGRESS_LABEL,
  EQUIPMENT_STEP_BROWSE_LABEL,
} from '../../lib/equipment-step.lib'
import { formatEquipmentBudgetGuidanceCopy } from './equipment-acquisition-guidance.lib'
import {
  equipmentAcquisitionGuidanceBadgeListClasses,
  equipmentAcquisitionGuidanceCardClasses,
  equipmentAcquisitionGuidanceGridClasses,
  equipmentAcquisitionGuidanceGridTwoColumnClasses,
} from './equipment-acquisition-guidance.variants'
import {
  equipmentAcquisitionGuidanceCardActionClasses,
  equipmentAcquisitionGuidanceCardDescriptionClasses,
} from './equipment-acquisition-panel.variants'

export type EquipmentAcquisitionGuidanceProps = {
  showPurchaseWorkflow: boolean
  budget?: EquipmentBudgetSummary
  onOpenPurchasePicker: () => void
  showMagicItemGrants: boolean
  magicItemProgress: readonly MagicItemGrantProgress[]
  onOpenMagicItemsPicker: () => void
}

function EquipmentPurchaseGuidanceCard({
  budget,
  onBrowse,
}: {
  budget: EquipmentBudgetSummary
  onBrowse: () => void
}) {
  const copy = formatEquipmentBudgetGuidanceCopy(budget)

  return (
    <article className={equipmentAcquisitionGuidanceCardClasses}>
      <Heading variant="subsection" as="h3">
        {copy.heading}
      </Heading>
      <Text as="p" className={equipmentAcquisitionGuidanceCardDescriptionClasses}>
        {copy.description}
      </Text>
      <Button
        type="button"
        size="sm"
        className={equipmentAcquisitionGuidanceCardActionClasses}
        onClick={onBrowse}
      >
        {EQUIPMENT_STEP_BROWSE_LABEL}
      </Button>
    </article>
  )
}

function EquipmentMagicItemGuidanceCard({
  progress,
  onChoose,
}: {
  progress: readonly MagicItemGrantProgress[]
  onChoose: () => void
}) {
  return (
    <article className={equipmentAcquisitionGuidanceCardClasses}>
      <Heading variant="subsection" as="h3">
        {EQUIPMENT_MAGIC_ITEMS_PROGRESS_LABEL}
      </Heading>
      <div className={equipmentAcquisitionGuidanceBadgeListClasses}>
        {progress.map((entry) => (
          <Badge
            key={entry.allowanceId}
            appearance="outline"
            tone={entry.isFilled ? 'success' : 'neutral'}
            size="sm"
          >
            {entry.selected}/{entry.capacity} {getMagicItemRarityLabel(entry.rarity)}
          </Badge>
        ))}
      </div>
      <Button
        type="button"
        size="sm"
        className={equipmentAcquisitionGuidanceCardActionClasses}
        onClick={onChoose}
      >
        {EQUIPMENT_MAGIC_ITEMS_CHOOSE_LABEL}
      </Button>
    </article>
  )
}

export function EquipmentAcquisitionGuidance({
  showPurchaseWorkflow,
  budget,
  onOpenPurchasePicker,
  showMagicItemGrants,
  magicItemProgress,
  onOpenMagicItemsPicker,
}: EquipmentAcquisitionGuidanceProps) {
  const showPurchase = showPurchaseWorkflow && budget !== undefined
  const showMagic = showMagicItemGrants && magicItemProgress.length > 0

  if (!showPurchase && !showMagic) return null

  const gridClass =
    showPurchase && showMagic
      ? equipmentAcquisitionGuidanceGridTwoColumnClasses
      : equipmentAcquisitionGuidanceGridClasses

  return (
    <section aria-label="Acquisition guidance" className={gridClass}>
      {showPurchase ? (
        <EquipmentPurchaseGuidanceCard budget={budget} onBrowse={onOpenPurchasePicker} />
      ) : null}
      {showMagic ? (
        <EquipmentMagicItemGuidanceCard
          progress={magicItemProgress}
          onChoose={onOpenMagicItemsPicker}
        />
      ) : null}
    </section>
  )
}
