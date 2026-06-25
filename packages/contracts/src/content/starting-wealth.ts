import { z } from 'zod'

import { tierBonusGoldSchema } from '../primitives/currency-formula'
import { absoluteLevelSchema } from '../primitives/level'
import { magicItemRaritySchema } from '../vocab/magic-item/rarity'
import {
  contentBodyBaseSchema,
  contentMetaSchema,
  contentPatchBaseSchema,
  slugSchema,
} from './envelope'

// ---------------------------------------------------------------------------
// Starting wealth — ruleset-scoped tier table for higher-level character creation.
// System records provide SRD defaults; campaigns can patch via homebrew overlays.
// ---------------------------------------------------------------------------

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

/** The editable shape: what a form authors and what a patch overrides. */
export const startingWealthBodySchema = contentBodyBaseSchema.extend({
  scope: startingWealthScopeSchema,
  tiers: startingWealthTiersSchema,
})

export type StartingWealthBody = z.infer<typeof startingWealthBodySchema>

/** Stored shape = ownership envelope + body. */
export const startingWealthSchema = contentMetaSchema.extend(startingWealthBodySchema.shape)
export type StartingWealth = z.infer<typeof startingWealthSchema>

export const createStartingWealthInputSchema = startingWealthBodySchema.extend({ slug: slugSchema })
export type CreateStartingWealthInput = z.infer<typeof createStartingWealthInputSchema>

export const updateStartingWealthInputSchema = createStartingWealthInputSchema.partial()
export type UpdateStartingWealthInput = z.infer<typeof updateStartingWealthInputSchema>

export const startingWealthPatchSchema = contentPatchBaseSchema.extend({
  patch: startingWealthBodySchema.partial(),
})
export type StartingWealthPatch = z.infer<typeof startingWealthPatchSchema>

/** Returns the tier matching a character level, if any. */
export function startingWealthTierForLevel(
  body: Pick<StartingWealthBody, 'tiers'>,
  level: number,
): StartingWealthTier | undefined {
  return body.tiers.find((tier) => level >= tier.minLevel && level <= tier.maxLevel)
}
