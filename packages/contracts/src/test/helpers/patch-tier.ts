import type {
  StartingWealthRules,
  StartingWealthTier,
} from '../../rpg/campaign/rules/starting-wealth'

/** Extends the seed's last tier to cover `maxLevel`. */
export function withLastTierMaxLevel(
  seed: StartingWealthRules,
  maxLevel: number,
): StartingWealthTier[] {
  const lastTierId = seed.tiers.at(-1)!.id

  return seed.tiers.map((tier) => (tier.id === lastTierId ? { ...tier, maxLevel } : tier))
}

/** Returns seed tiers with one tier patched by id. */
export function patchTierById(
  seed: StartingWealthRules,
  id: string,
  partial: Partial<StartingWealthTier>,
): StartingWealthTier[] {
  return seed.tiers.map((tier) => (tier.id === id ? { ...tier, ...partial } : tier))
}
