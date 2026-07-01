import { z } from 'zod'

import type { SystemRulesetId } from '../../primitives/ruleset'
import { tierBonusGoldSchema } from '../../primitives/currency-formula'
import { absoluteLevelSchema } from '../../primitives/level'
import { magicItemRaritySchema } from '../../vocab/magic-item/rarity'

// ---------------------------------------------------------------------------
// Starting wealth — campaign rules for higher-level character creation tiers.
// SRD defaults ship from @rpg/catalog; campaigns patch via ruleset-patch.
// ---------------------------------------------------------------------------

export const STANDARD_STARTING_WEALTH_SLUG = 'standard-starting-wealth' as const

export type StandardStartingWealthSlug = typeof STANDARD_STARTING_WEALTH_SLUG

/** Deterministic table id for the standard SRD starting wealth table. */
export function standardStartingWealthTableId(rulesetId: SystemRulesetId): string {
  return `${rulesetId}:${STANDARD_STARTING_WEALTH_SLUG}`
}

export const STARTING_WEALTH_SCOPE_KINDS = ['standard'] as const

export const startingWealthScopeKindSchema = z.enum(STARTING_WEALTH_SCOPE_KINDS)

export type StartingWealthScopeKind = z.infer<typeof startingWealthScopeKindSchema>

export const standardStartingWealthScopeSchema = z
  .object({
    kind: z.literal('standard'),
  })
  .strict()

export const startingWealthScopeSchema = z.discriminatedUnion('kind', [
  standardStartingWealthScopeSchema,
])

export type StartingWealthScope = z.infer<typeof startingWealthScopeSchema>

export const magicItemRarityGrantSchema = z.object({
  rarity: magicItemRaritySchema,
  quantity: z.number().int().min(1),
})

export type MagicItemRarityGrant = z.infer<typeof magicItemRarityGrantSchema>

export const startingWealthTierSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  minLevel: absoluteLevelSchema,
  maxLevel: absoluteLevelSchema,
  includeNormalStartingEquipment: z.boolean().default(true),
  bonusGold: tierBonusGoldSchema.nullable().optional(),
  magicItemGrants: z.array(magicItemRarityGrantSchema).default([]),
})

export type StartingWealthTier = z.infer<typeof startingWealthTierSchema>

export const startingWealthTiersSchema = z
  .array(startingWealthTierSchema)
  .min(1)
  .superRefine((tiers, ctx) => {
    tiers.forEach((tier, index) => {
      if (tier.minLevel > tier.maxLevel) {
        ctx.addIssue({
          code: 'custom',
          message: 'minLevel must not exceed maxLevel',
          path: [index, 'minLevel'],
        })
      }

      const previousTier = tiers[index - 1]
      if (previousTier !== undefined && tier.minLevel <= previousTier.maxLevel) {
        ctx.addIssue({
          code: 'custom',
          message: 'tier level ranges must not overlap',
          path: [index, 'minLevel'],
        })
      }
    })
  })

export type StartingWealthTiers = z.infer<typeof startingWealthTiersSchema>

/** Cross-type body fields mirrored from catalog content bodies (without content envelope). */
const startingWealthRulesBaseSchema = z.object({
  /** Storage key for artwork. Resolve to a URL with `getAssetUrl`. */
  imageKey: z.string().optional(),
  name: z.string().min(1),
  /** Rich-text HTML (TipTap / SRD prose). Render with `RichTextContent`. */
  description: z.string().optional(),
})

/** Full starting wealth rules body — catalog seed shape and resolved campaign rules. */
export const startingWealthRulesSchema = startingWealthRulesBaseSchema.extend({
  scope: startingWealthScopeSchema,
  tiers: startingWealthTiersSchema,
})

export type StartingWealthRules = z.infer<typeof startingWealthRulesSchema>

/** Sparse override stored on CampaignRulesetPatch.characterCreation.startingWealth. */
export const startingWealthRulesPatchSchema = startingWealthRulesSchema.partial()

export type StartingWealthRulesPatch = z.infer<typeof startingWealthRulesPatchSchema>

/** Merges a sparse campaign patch onto the catalog seed (tiers replace wholesale). */
export function resolveStartingWealthRules(
  seed: StartingWealthRules,
  patch?: StartingWealthRulesPatch,
): StartingWealthRules {
  if (!patch) return seed

  return {
    ...seed,
    ...patch,
    scope: patch.scope ?? seed.scope,
    tiers: patch.tiers ?? seed.tiers,
  }
}

/** Returns the tier matching a character level, if any. */
export function startingWealthTierForLevel(
  rules: Pick<StartingWealthRules, 'tiers'>,
  level: number,
): StartingWealthTier | undefined {
  return rules.tiers.find((tier) => level >= tier.minLevel && level <= tier.maxLevel)
}
