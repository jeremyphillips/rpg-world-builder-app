import type { StartingWealthTier, SystemRulesetId } from '@rpg/contracts'

import { getStandardStartingWealthRules } from './index'

const DEFAULT_RULESET_ID = 'srd-cc-5.2.1' as const satisfies SystemRulesetId

const defaultCatalogSeed = getStandardStartingWealthRules(DEFAULT_RULESET_ID)

/** First SRD starting wealth tier id — aligned with catalog seed (`initiate`). */
export const INITIATE_TIER_ID = defaultCatalogSeed.tiers[0]!.id

/** Last SRD starting wealth tier id — aligned with catalog seed (`legend`). */
export const LEGEND_TIER_ID = defaultCatalogSeed.tiers.at(-1)!.id

/** Catalog rules body for the standard SRD starting wealth table. */
export function standardStartingWealthSeed(rulesetId: SystemRulesetId = DEFAULT_RULESET_ID) {
  return getStandardStartingWealthRules(rulesetId)
}

/** Extends the catalog seed's last tier to cover `maxLevel` (e.g. extended progression). */
export function withLastTierMaxLevel(
  maxLevel: number,
  rulesetId: SystemRulesetId = DEFAULT_RULESET_ID,
) {
  const tiers = getStandardStartingWealthRules(rulesetId).tiers
  const lastTierId = tiers.at(-1)!.id

  return tiers.map((tier) => (tier.id === lastTierId ? { ...tier, maxLevel } : tier))
}

/** Returns catalog seed tiers with one tier patched by id. */
export function patchStartingWealthTierById(
  tierId: string,
  patch: Partial<StartingWealthTier>,
  rulesetId: SystemRulesetId = DEFAULT_RULESET_ID,
) {
  return getStandardStartingWealthRules(rulesetId).tiers.map((tier) =>
    tier.id === tierId ? { ...tier, ...patch } : tier,
  )
}

/** Patches the initiate tier on the catalog seed. */
export function patchInitiateTier(
  patch: Partial<StartingWealthTier>,
  rulesetId: SystemRulesetId = DEFAULT_RULESET_ID,
) {
  return patchStartingWealthTierById(INITIATE_TIER_ID, patch, rulesetId)
}

/** Alias for {@link patchInitiateTier} — matches API test fixture naming. */
export const patchInitiateStartingWealthTier = patchInitiateTier
