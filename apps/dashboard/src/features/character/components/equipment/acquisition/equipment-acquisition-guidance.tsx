import type { EquipmentBudgetSummary, MagicItemGrantProgress } from '@rpg/contracts'
import { getMagicItemRarityLabel } from '@rpg/contracts'
import { Badge, Button, Heading, Text } from '@rpg/ui'

import {
  EQUIPMENT_MAGIC_ITEMS_CHOOSE_LABEL,
  EQUIPMENT_MAGIC_ITEMS_PROGRESS_LABEL,
  EQUIPMENT_STEP_BROWSE_LABEL,
  type EquipmentStepFundingState,
} from '../../../lib/equipment/equipment-step.lib'
import {
  EQUIPMENT_UNRESOLVED_FUNDING_DESCRIPTION,
  EQUIPMENT_UNRESOLVED_FUNDING_HEADING,
  formatEquipmentBudgetGuidanceCopy,
  formatEquipmentUnresolvedFundingSelectedLabel,
  resolveFundingGuidanceCard,
} from './equipment-acquisition-guidance.lib'
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
  fundingState: EquipmentStepFundingState
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

function EquipmentUnresolvedFundingCard({ pendingCostCp }: { pendingCostCp: number }) {
  return (
    <article className={equipmentAcquisitionGuidanceCardClasses}>
      <Heading variant="subsection" as="h3">
        {EQUIPMENT_UNRESOLVED_FUNDING_HEADING}
      </Heading>
      <Text as="p" className={equipmentAcquisitionGuidanceCardDescriptionClasses}>
        {EQUIPMENT_UNRESOLVED_FUNDING_DESCRIPTION}
      </Text>
      <Text as="p" className={equipmentAcquisitionGuidanceCardDescriptionClasses}>
        {formatEquipmentUnresolvedFundingSelectedLabel(pendingCostCp)}
      </Text>
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

function EquipmentFundingGuidanceCard({
  fundingState,
  onBrowse,
}: {
  fundingState: Exclude<EquipmentStepFundingState, { kind: 'none' }>
  onBrowse: () => void
}) {
  if (fundingState.kind === 'unresolved') {
    return <EquipmentUnresolvedFundingCard pendingCostCp={fundingState.pendingCostCp} />
  }
  return <EquipmentPurchaseGuidanceCard budget={fundingState.budget} onBrowse={onBrowse} />
}

export function EquipmentAcquisitionGuidance({
  showPurchaseWorkflow,
  fundingState,
  onOpenPurchasePicker,
  showMagicItemGrants,
  magicItemProgress,
  onOpenMagicItemsPicker,
}: EquipmentAcquisitionGuidanceProps) {
  const fundingCard = resolveFundingGuidanceCard(fundingState, showPurchaseWorkflow)
  const showMagic = showMagicItemGrants && magicItemProgress.length > 0

  if (!fundingCard && !showMagic) return null

  const gridClass =
    fundingCard && showMagic
      ? equipmentAcquisitionGuidanceGridTwoColumnClasses
      : equipmentAcquisitionGuidanceGridClasses

  return (
    <section aria-label="Acquisition guidance" className={gridClass}>
      {fundingCard ? (
        <EquipmentFundingGuidanceCard fundingState={fundingCard} onBrowse={onOpenPurchasePicker} />
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
