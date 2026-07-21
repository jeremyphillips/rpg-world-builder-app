import type { StartingWealthTier } from '../../../../campaign/rules/starting-wealth'
import type { MagicItemAllowance } from '../../magic-item-selection'
import { buildMagicItemAllowanceId } from '../../magic-item-selection'

/** Resolves tier magic-item grants into globally stable allowance rows. */
export function resolveMagicItemGrantAllowances(args: {
  startingWealthTableId: string
  tier: StartingWealthTier
}): MagicItemAllowance[] {
  const { startingWealthTableId, tier } = args

  return tier.magicItemGrants.map((grant) => ({
    id: buildMagicItemAllowanceId({
      startingWealthTableId,
      tierId: tier.id,
      rarity: grant.rarity,
    }),
    source: {
      kind: 'startingWealthTier',
      sourceId: startingWealthTableId,
      tierId: tier.id,
    },
    rarity: grant.rarity,
    count: grant.quantity,
    requirement: 'exact',
  }))
}
