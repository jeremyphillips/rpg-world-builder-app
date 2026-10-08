import { z } from 'zod'

import { absoluteLevelSchema } from '../primitives/level'
import { equipmentPoolSchema } from './lib/grants/equipment-grant'

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
] as const

export type EquipmentRecommendationTier = (typeof EQUIPMENT_RECOMMENDATION_TIERS)[number]

/**
 * Derivation precedence when several contributions merge onto one recommendation.
 * Lower numbers win. Picker browse does not read this.
 */
export const EQUIPMENT_RECOMMENDATION_TIER_PRECEDENCE = {
  essential: 0,
  strong: 1,
  compatible: 2,
  neutral: 3,
} as const satisfies Record<EquipmentRecommendationTier, number>

export const EQUIPMENT_RECOMMENDATION_REASONS = [
  /** Authored essential rule match (class-critical gear like the Wizard spellbook). */
  'classRequired',
  /** Authored strong rule match. */
  'classSuggested',
  /** Fixed class tool grant (Rogue thieves' tools). */
  'classToolNeed',
  /** Player-selected tool proficiency from a ChoiceSet. */
  'selectedToolProficiency',
  /** Gear matching the class's usable spellcasting focus kinds. */
  'spellcastingFocus',
  /** Resolved item in the selected starting-equipment package. */
  'startingEquipment',
  /** Unselected members of an in-progress tool proficiency pool choice. */
  'unresolvedToolProficiencyChoice',
  /** Active unresolved nested starting-equipment pool in the selected package. */
  'startingEquipmentChoice',
  /** Semantic category sibling after a multi-select proficiency pool resolves. */
  'classToolCategory',
  /** Item appears in an unselected or preview starting-equipment branch. */
  'availableInStartingOption',
] as const

export type EquipmentRecommendationReason = (typeof EQUIPMENT_RECOMMENDATION_REASONS)[number]

export const EQUIPMENT_RECOMMENDATION_SPECIFICITIES = [
  'exact',
  'narrow_pool',
  'broad_pool',
] as const

export type EquipmentRecommendationSpecificity =
  (typeof EQUIPMENT_RECOMMENDATION_SPECIFICITIES)[number]

/**
 * Derivation precedence for the specificity stamped on a collapsed recommendation.
 * Lower numbers win. Picker browse uses `compareSpecificity` instead.
 */
export const EQUIPMENT_RECOMMENDATION_SPECIFICITY_PRECEDENCE = {
  exact: 0,
  narrow_pool: 1,
  broad_pool: 2,
} as const satisfies Record<EquipmentRecommendationSpecificity, number>

export type EquipmentRecommendation = {
  tier: EquipmentRecommendationTier
  reasons: readonly EquipmentRecommendationReason[]
  /** Collapsed best (most specific) evidence among contributing signals. */
  specificity: EquipmentRecommendationSpecificity
  /** Authored badge override from the matching rule, when present. */
  label?: string
}

export type EquipmentRecommendationEvidence = {
  reason: EquipmentRecommendationReason
  tier: EquipmentRecommendationTier
  specificity: EquipmentRecommendationSpecificity
}

export const NEUTRAL_EQUIPMENT_RECOMMENDATION: EquipmentRecommendation = {
  tier: 'neutral',
  reasons: [],
  specificity: 'broad_pool',
}

/** Recommended-tab membership is intentionally narrow: essential and strong only. */
export function isRecommendedEquipmentTier(tier: EquipmentRecommendationTier): boolean {
  return (
    EQUIPMENT_RECOMMENDATION_TIER_PRECEDENCE[tier] <=
    EQUIPMENT_RECOMMENDATION_TIER_PRECEDENCE.strong
  )
}

/** Derivation precedence — more specific evidence wins when a recommendation is collapsed. Not picker browse order. */
export function compareEquipmentRecommendationSpecificity(
  left: EquipmentRecommendationSpecificity,
  right: EquipmentRecommendationSpecificity,
): number {
  return (
    EQUIPMENT_RECOMMENDATION_SPECIFICITY_PRECEDENCE[left] -
    EQUIPMENT_RECOMMENDATION_SPECIFICITY_PRECEDENCE[right]
  )
}

function bestSpecificityFromEvidence(
  evidence: readonly EquipmentRecommendationEvidence[],
): EquipmentRecommendationSpecificity {
  return evidence.reduce<EquipmentRecommendationSpecificity>((best, row) => {
    return compareEquipmentRecommendationSpecificity(row.specificity, best) < 0
      ? row.specificity
      : best
  }, 'broad_pool')
}

/** Most specific evidence on a collapsed recommendation. Not picker browse order. */
export function getBestEquipmentRecommendationSpecificity(
  input: EquipmentRecommendation | readonly EquipmentRecommendationEvidence[],
): EquipmentRecommendationSpecificity {
  if ('specificity' in input && !Array.isArray(input)) return input.specificity
  if (input.length === 0) return 'broad_pool'
  return bestSpecificityFromEvidence(input)
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
