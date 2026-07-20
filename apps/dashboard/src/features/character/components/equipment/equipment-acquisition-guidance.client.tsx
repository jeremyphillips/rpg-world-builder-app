'use client'

import type { EquipmentBudgetSummary, MagicItemGrantProgress } from '@rpg/contracts'
import { getMagicItemRarityLabel } from '@rpg/contracts'
import { Badge, Button, Heading } from '@rpg/ui'

import {
  EQUIPMENT_MAGIC_ITEMS_CHOOSE_LABEL,
  EQUIPMENT_MAGIC_ITEMS_PROGRESS_LABEL,
  EQUIPMENT_STEP_BROWSE_LABEL,
} from '../../lib/equipment-step.lib'
import { EquipmentBudgetHeader } from './equipment-budget-header.client'
import {
  equipmentAcquisitionGuidanceBadgeListClasses,
  equipmentAcquisitionGuidanceCardClasses,
  equipmentAcquisitionGuidanceCardHeaderClasses,
  equipmentAcquisitionGuidanceGridClasses,
  equipmentAcquisitionGuidanceGridTwoColumnClasses,
} from './equipment-acquisition-guidance.variants'

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
  return (
    <article className={equipmentAcquisitionGuidanceCardClasses}>
      <div className={equipmentAcquisitionGuidanceCardHeaderClasses}>
        <Heading variant="subsection" as="h3">
          GP remaining
        </Heading>
        <Button type="button" size="sm" onClick={onBrowse}>
          {EQUIPMENT_STEP_BROWSE_LABEL}
        </Button>
      </div>
      <EquipmentBudgetHeader budget={budget} />
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
      <div className={equipmentAcquisitionGuidanceCardHeaderClasses}>
        <Heading variant="subsection" as="h3">
          {EQUIPMENT_MAGIC_ITEMS_PROGRESS_LABEL}
        </Heading>
        <Button type="button" size="sm" onClick={onChoose}>
          {EQUIPMENT_MAGIC_ITEMS_CHOOSE_LABEL}
        </Button>
      </div>
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
