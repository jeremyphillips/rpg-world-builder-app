import {
  formatInlineWealth,
  wealthToCopper,
  type StartingEquipmentOptionSummary,
} from '@rpg/contracts'

export type StartingEquipmentTierContributionCopy = {
  baseLabel: string
  totalLabel: string
}

/** Base and total purses when the tier adds gold. A zero class amount still renders. */
export function formatStartingEquipmentTierContribution(
  summary: Pick<StartingEquipmentOptionSummary, 'funding'>,
): StartingEquipmentTierContributionCopy | undefined {
  if (wealthToCopper(summary.funding.tierAdditionalWealth) === 0) return undefined

  return {
    baseLabel: `${formatInlineWealth(summary.funding.classOptionWealth)} base`,
    totalLabel: `${formatInlineWealth(summary.funding.totalStartingWealth)} total`,
  }
}
