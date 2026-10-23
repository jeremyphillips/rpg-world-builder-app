import type { CharacterWealth, StartingEquipmentOptionSummary, TierBonusGold } from '@rpg/contracts'
import {
  Badge,
  Icon,
  InlineMetadata,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@rpg/ui'

import { formatStartingEquipmentTierContribution } from './starting-equipment-tier-contribution.lib'
import { StartingGoldBonusTooltipBody } from './starting-gold-bonus-tooltip'

export type StartingEquipmentTierContributionProps = {
  summary: Pick<StartingEquipmentOptionSummary, 'funding'>
}

function StartingGoldBonusTierBadge({
  tierLabel,
  bonusWealth,
  bonusGold,
}: {
  tierLabel: string
  bonusWealth: CharacterWealth
  bonusGold: TierBonusGold
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Badge
              appearance="soft"
              tone="neutral"
              size="sm"
              trailingIcon={<Icon name="info" size="inline" />}
            >
              {tierLabel} tier
            </Badge>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <StartingGoldBonusTooltipBody bonusWealth={bonusWealth} bonusGold={bonusGold} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/** Shared base and total line for package radios, gold radios, and the selected package card. */
export function StartingEquipmentTierContribution({
  summary,
}: StartingEquipmentTierContributionProps) {
  const tierContribution = formatStartingEquipmentTierContribution(summary)
  if (!tierContribution) return null

  const { tierLabel, bonusGold, tierAdditionalWealth } = summary.funding

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-style-caption">
      <InlineMetadata role="heading" density="compact">
        <InlineMetadata.Item className="font-normal text-muted-foreground">
          {tierContribution.baseLabel}
        </InlineMetadata.Item>
        <InlineMetadata.Item className="font-normal text-foreground">
          {tierContribution.totalLabel}
        </InlineMetadata.Item>
      </InlineMetadata>
      {tierLabel && bonusGold ? (
        <StartingGoldBonusTierBadge
          tierLabel={tierLabel}
          bonusWealth={tierAdditionalWealth}
          bonusGold={bonusGold}
        />
      ) : null}
    </div>
  )
}
