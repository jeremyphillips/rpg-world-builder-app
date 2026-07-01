import { z } from 'zod'

import { systemRulesetIdSchema, type SystemRulesetId } from '../../primitives/ruleset'
import { tierBonusGoldSchema } from '../../primitives/currency-formula'
import { absoluteLevelSchema } from '../../primitives/level'
import { levelRangeTiersSchema } from '../../primitives/level-range-table'
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

const startingWealthTierRowShape = {
  id: z.string().min(1),
  label: z.string().min(1),
  includeNormalStartingEquipment: z.boolean().default(true),
  bonusGold: tierBonusGoldSchema.nullable().optional(),
  magicItemGrants: z.array(magicItemRarityGrantSchema).default([]),
}

export const startingWealthTierSchema = z.object({
  minLevel: absoluteLevelSchema,
  maxLevel: absoluteLevelSchema,
  ...startingWealthTierRowShape,
})

export type StartingWealthTier = z.infer<typeof startingWealthTierSchema>

export const startingWealthTiersSchema = levelRangeTiersSchema(startingWealthTierRowShape, {
  requireStartAt: 1,
  min: 1,
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

/** Merges sparse patch layers (tiers replace wholesale when present). */
export function mergeStartingWealthRulesPatch(
  existing: StartingWealthRulesPatch | undefined,
  input: StartingWealthRulesPatch,
): StartingWealthRulesPatch {
  return {
    ...existing,
    ...input,
    scope: input.scope ?? existing?.scope,
    tiers: input.tiers ?? existing?.tiers,
  }
}

/** Merges a sparse campaign patch onto the catalog seed (tiers replace wholesale). */
export function resolveStartingWealthRules(
  seed: StartingWealthRules,
  patch?: StartingWealthRulesPatch,
): StartingWealthRules {
  if (!patch) return seed

  return mergeStartingWealthRulesPatch(seed, patch) as StartingWealthRules
}

function tiersEqual(a: StartingWealthTier[], b: StartingWealthTier[]): boolean {
  if (a.length !== b.length) return false

  return a.every((tier, index) => {
    const left = startingWealthTierSchema.parse(tier)
    const right = startingWealthTierSchema.parse(b[index])
    return JSON.stringify(left) === JSON.stringify(right)
  })
}

function startingWealthFieldEquals(
  a: StartingWealthRules[keyof StartingWealthRules],
  b: StartingWealthRules[keyof StartingWealthRules],
): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return tiersEqual(a as StartingWealthTier[], b as StartingWealthTier[])
  }

  return JSON.stringify(a) === JSON.stringify(b)
}

/** Returns only fields that differ from the catalog seed — for sparse Mongo storage. */
export function computeStartingWealthSparsePatch(
  resolved: StartingWealthRules,
  seed: StartingWealthRules,
): StartingWealthRulesPatch | undefined {
  const sparse: StartingWealthRulesPatch = {}

  if (resolved.name !== seed.name) sparse.name = resolved.name
  if (resolved.description !== seed.description) sparse.description = resolved.description
  if (resolved.imageKey !== seed.imageKey) sparse.imageKey = resolved.imageKey
  if (!startingWealthFieldEquals(resolved.scope, seed.scope)) sparse.scope = resolved.scope
  if (!startingWealthFieldEquals(resolved.tiers, seed.tiers)) sparse.tiers = resolved.tiers

  return Object.keys(sparse).length > 0 ? sparse : undefined
}

const startingWealthTableSlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

const startingWealthTableMetaSchema = z.object({
  id: z.string().min(1),
  slug: startingWealthTableSlugSchema,
  rulesetId: systemRulesetIdSchema,
  source: z.enum(['system', 'homebrew']),
  campaignId: z.string().min(1).nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
})

/** Catalog read DTO — system seed table with deterministic id and ownership meta. */
export const startingWealthTableSchema = startingWealthTableMetaSchema.extend(
  startingWealthRulesSchema.shape,
)

export type StartingWealth = z.infer<typeof startingWealthTableSchema>

/** Returns the tier matching a character level, if any. */
export function startingWealthTierForLevel(
  rules: Pick<StartingWealthRules, 'tiers'>,
  level: number,
): StartingWealthTier | undefined {
  return rules.tiers.find((tier) => level >= tier.minLevel && level <= tier.maxLevel)
}
