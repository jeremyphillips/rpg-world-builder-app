import { z } from 'zod'

import { absoluteLevelSchema } from '../primitives/level'
import { equipmentPoolSchema } from './lib/equipment-grant'

// ---------------------------------------------------------------------------
// Equipment recommendations — tiered picker guidance for character creation.
//
// Most recommendations are inferred from data classes already author (starting
// equipment, item-level tool proficiencies, spellcasting focus kinds), so a
// homebrew class gets a sensible Recommended tab with zero extra authoring.
// Authored rules augment inference where it cannot reach (Wizard spellbook).
//
// Rules are soft references: a rule whose targets do not resolve in the
// catalog simply matches nothing at derivation time. Authoring order never
// blocks — a class may reference gear that has not been authored yet.
// ---------------------------------------------------------------------------

export const EQUIPMENT_RECOMMENDATION_TIERS = [
  'essential',
  'strong',
  'compatible',
  'neutral',
  'notRecommended',
] as const

export type EquipmentRecommendationTier = (typeof EQUIPMENT_RECOMMENDATION_TIERS)[number]

/** Sort rank per tier — lower ranks list first in pickers. */
export const EQUIPMENT_RECOMMENDATION_TIER_RANK = {
  essential: 0,
  strong: 1,
  compatible: 2,
  neutral: 3,
  notRecommended: 4,
} as const satisfies Record<EquipmentRecommendationTier, number>

export const EQUIPMENT_RECOMMENDATION_REASONS = [
  /** Authored essential rule match (class-critical gear like the Wizard spellbook). */
  'classRequired',
  /** Authored strong rule match. */
  'classSuggested',
  /** Item-level tool proficiency (Rogue thieves' tools, chosen Bard instrument). */
  'classToolNeed',
  /** Gear matching the class's usable spellcasting focus kinds. */
  'spellcastingFocus',
  /** Named item in a class starting-equipment package (grant or explicit pool). */
  'startingEquipment',
  /** Weapon/armor/tool covered by the character's proficiencies. */
  'proficient',
  /** Weapon/armor/tool outside the character's proficiencies. */
  'notProficient',
] as const

export type EquipmentRecommendationReason = (typeof EQUIPMENT_RECOMMENDATION_REASONS)[number]

export type EquipmentRecommendation = {
  tier: EquipmentRecommendationTier
  reasons: readonly EquipmentRecommendationReason[]
  /** Authored badge override from the matching rule, when present. */
  label?: string
}

export const NEUTRAL_EQUIPMENT_RECOMMENDATION: EquipmentRecommendation = {
  tier: 'neutral',
  reasons: [],
}

/** Recommended-tab membership is intentionally narrow: essential and strong only. */
export function isRecommendedEquipmentTier(tier: EquipmentRecommendationTier): boolean {
  return EQUIPMENT_RECOMMENDATION_TIER_RANK[tier] <= EQUIPMENT_RECOMMENDATION_TIER_RANK.strong
}

/** Comparator over tiers — essential first, not-recommended last. */
export function compareEquipmentRecommendationTiers(
  left: EquipmentRecommendationTier,
  right: EquipmentRecommendationTier,
): number {
  return EQUIPMENT_RECOMMENDATION_TIER_RANK[left] - EQUIPMENT_RECOMMENDATION_TIER_RANK[right]
}

// ---------------------------------------------------------------------------
// Authored rules — class characterCreation.equipmentRecommendations.
// Owner-agnostic shape so subclasses/backgrounds can adopt the same rules later
// without changing the derivation model.
// ---------------------------------------------------------------------------

export const equipmentRecommendationRuleSchema = z.object({
  /**
   * What the rule matches — the shared equipment pool primitive (explicit
   * slugs, or an equipment kind + category filter). Matches by stable slug/id
   * and category, never by display name.
   */
  match: equipmentPoolSchema,
  /** Optional refinement: pool matches must also carry this equipment tag. */
  tag: z.string().min(1).optional(),
  /** Class level at which the rule activates (defaults to 1). */
  minLevel: absoluteLevelSchema.optional(),
  /** Optional picker badge label override (e.g. "Spellbook"). */
  label: z.string().min(1).optional(),
})

export type EquipmentRecommendationRule = z.infer<typeof equipmentRecommendationRuleSchema>

export const equipmentRecommendationsSchema = z.object({
  essential: z.array(equipmentRecommendationRuleSchema).optional(),
  strong: z.array(equipmentRecommendationRuleSchema).optional(),
})

export type EquipmentRecommendations = z.infer<typeof equipmentRecommendationsSchema>
