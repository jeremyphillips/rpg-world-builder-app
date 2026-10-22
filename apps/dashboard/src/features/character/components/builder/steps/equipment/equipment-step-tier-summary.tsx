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
  interactiveFocusVariants,
  interactivePointerClasses,
  Panel,
} from '@rpg/ui'

import { formatMagicItemChoiceGrantValue } from '../../../../lib/equipment/magic-item-choice-label.lib'
import { StartingGoldBonusFormulaTooltip } from '../../../equipment/starting-package/starting-gold-bonus-tooltip'
import { STARTING_GOLD_BONUS_LABEL } from '../../../equipment/starting-package/starting-gold-bonus-tooltip.variants'
const MAGIC_ITEM_CHOICES_LABEL = 'Magic item choices'
const STARTING_GOLD_BONUS_FORMULA_LABEL = 'About starting gold bonus'

const tierSummaryEmbeddedTriggerClasses = cn(
  'flex w-full min-w-0 items-center gap-3 text-left text-sm',
  interactivePointerClasses,
  interactiveFocusVariants({ context: 'embedded' }),
)

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
      <InlineMetadata.Item className="font-medium text-foreground">
        {resources.tier.label} tier
      </InlineMetadata.Item>
      <InlineMetadata.Item className="font-normal text-muted-foreground">
        {formatLevelRangeLabel(resources.tier)}
      </InlineMetadata.Item>
    </InlineMetadata>
  )

  const count = <span className="shrink-0 text-style-caption">{benefitLabel}</span>

  if (benefitCount === 0) {
    return (
      <div className="flex w-full min-w-0 items-center gap-3 text-sm">
        {heading}
        <span className="ml-auto">{count}</span>
      </div>
    )
  }

  return (
    // TODO(disclosure): consolidate ad hoc collapsible trigger/caret with shared @rpg/ui disclosure primitives.
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button type="button" className={tierSummaryEmbeddedTriggerClasses}>
          {heading}
          <span className="ml-auto inline-flex shrink-0 items-center gap-1">
            <span className="shrink-0 text-style-caption">{benefitLabel}</span>
            <ChevronDown
              aria-hidden
              className={cn(
                'size-icon-glyph-sm shrink-0 text-muted-foreground transition-transform',
                open && 'rotate-180',
              )}
            />
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <Panel
          tone="subtle"
          density="compact"
          className="mt-1 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 text-style-caption"
        >
          {hasBonusWealth ? (
            <>
              <span className="text-muted-foreground">{STARTING_GOLD_BONUS_LABEL}</span>
              <span className="inline-flex items-center justify-end gap-1 text-right text-foreground">
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
              <span className="text-muted-foreground">{MAGIC_ITEM_CHOICES_LABEL}</span>
              <span className="inline-flex items-center justify-end gap-1 text-right text-foreground">
                {magicItemValue}
              </span>
            </>
          ) : null}
        </Panel>
      </CollapsibleContent>
    </Collapsible>
  )
}
