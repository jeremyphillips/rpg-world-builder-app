import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import {
  formatInlineWealth,
  formatLevelRangeLabel,
  resolveStartingEquipmentTierResources,
  wealthToCopper,
  type StartingWealthRules,
} from '@rpg/contracts'
import {
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  InfoTooltip,
  InlineMetadata,
} from '@rpg/ui'

import { formatMagicItemChoiceGrantValue } from '../../../../lib/equipment/magic-item-choice-label.lib'
import { StartingGoldBonusFormulaTooltip } from '../../../equipment/starting-package/starting-gold-bonus-tooltip'
import {
  STARTING_GOLD_BONUS_LABEL,
  startingGoldBonusKeyVariants,
  startingGoldBonusValueVariants,
} from '../../../equipment/starting-package/starting-gold-bonus-tooltip.variants'
import {
  equipmentStepTierSummaryBodyVariants,
  equipmentStepTierSummaryCaretVariants,
  equipmentStepTierSummaryCountVariants,
  equipmentStepTierSummaryLevelVariants,
  equipmentStepTierSummaryNameVariants,
  equipmentStepTierSummaryPanelVariants,
  equipmentStepTierSummaryStaticVariants,
  equipmentStepTierSummaryTriggerVariants,
  equipmentStepTierSummaryValueVariants,
} from './equipment-step-tier-summary.variants'

const MAGIC_ITEM_CHOICES_LABEL = 'Magic item choices'
const STARTING_GOLD_BONUS_FORMULA_LABEL = 'About starting gold bonus'

export type EquipmentStepTierSummaryProps = {
  startingWealth: StartingWealthRules | undefined
  startingLevel: number
  defaultOpen?: boolean
}

function formatEquipmentTierBenefitCount(count: number): string {
  if (count === 0) return 'No benefits'
  if (count === 1) return '1 benefit'
  return `${count} benefits`
}

/** Quiet tier disclosure under the equipment step header. */
export function EquipmentStepTierSummary({
  startingWealth,
  startingLevel,
  defaultOpen = false,
}: EquipmentStepTierSummaryProps) {
  const [open, setOpen] = useState(defaultOpen)
  const resources = resolveStartingEquipmentTierResources({ startingWealth, startingLevel })
  if (!resources) return null

  const hasBonusWealth = wealthToCopper(resources.bonusWealth) > 0
  const magicItemValue = formatMagicItemChoiceGrantValue(resources.tier.magicItemGrants)
  const benefitCount = Number(hasBonusWealth) + Number(magicItemValue != null)
  const benefitLabel = formatEquipmentTierBenefitCount(benefitCount)
  const bonusGold = resources.tier.bonusGold

  const heading = (
    <InlineMetadata role="heading" density="compact">
      <InlineMetadata.Item className={equipmentStepTierSummaryNameVariants()}>
        {resources.tier.label} tier
      </InlineMetadata.Item>
      <InlineMetadata.Item className={equipmentStepTierSummaryLevelVariants()}>
        {formatLevelRangeLabel(resources.tier)}
      </InlineMetadata.Item>
    </InlineMetadata>
  )

  const count = <span className={equipmentStepTierSummaryCountVariants()}>{benefitLabel}</span>

  if (benefitCount === 0) {
    return (
      <div className={equipmentStepTierSummaryStaticVariants()}>
        {heading}
        <span className="ml-auto">{count}</span>
      </div>
    )
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button type="button" className={equipmentStepTierSummaryTriggerVariants()}>
          {heading}
          <span className="ml-auto inline-flex shrink-0 items-center gap-1">
            <span className={equipmentStepTierSummaryCountVariants()}>{benefitLabel}</span>
            <ChevronDown
              aria-hidden
              className={cn(equipmentStepTierSummaryCaretVariants(), open && 'rotate-180')}
            />
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          equipmentStepTierSummaryPanelVariants(),
          equipmentStepTierSummaryBodyVariants(),
        )}
      >
        {hasBonusWealth ? (
          <>
            <span className={startingGoldBonusKeyVariants()}>{STARTING_GOLD_BONUS_LABEL}</span>
            <span
              className={cn(
                equipmentStepTierSummaryValueVariants(),
                startingGoldBonusValueVariants(),
              )}
            >
              +{formatInlineWealth(resources.bonusWealth)}
              {bonusGold ? (
                <InfoTooltip aria-label={STARTING_GOLD_BONUS_FORMULA_LABEL}>
                  <StartingGoldBonusFormulaTooltip bonusGold={bonusGold} />
                </InfoTooltip>
              ) : null}
            </span>
          </>
        ) : null}
        {magicItemValue ? (
          <>
            <span className={startingGoldBonusKeyVariants()}>{MAGIC_ITEM_CHOICES_LABEL}</span>
            <span
              className={cn(
                equipmentStepTierSummaryValueVariants(),
                startingGoldBonusValueVariants(),
              )}
            >
              {magicItemValue}
            </span>
          </>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  )
}
