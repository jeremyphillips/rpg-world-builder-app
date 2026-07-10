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
  /** Weapon/armor/tool covered by the character's proficiencies. */
  'proficient',
  /** Weapon/armor/tool outside the character's proficiencies. */
  'notProficient',
] as const

export type EquipmentRecommendationReason = (typeof EQUIPMENT_RECOMMENDATION_REASONS)[number]

export const EQUIPMENT_RECOMMENDATION_SPECIFICITIES = [
  'exact',
  'narrow_pool',
  'broad_pool',
] as const

export type EquipmentRecommendationSpecificity =
  (typeof EQUIPMENT_RECOMMENDATION_SPECIFICITIES)[number]

/** Sort rank per specificity — lower ranks list first within the same tier. */
export const EQUIPMENT_RECOMMENDATION_SPECIFICITY_RANK = {
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
  sourceKey: string
  specificity: EquipmentRecommendationSpecificity
}

export const NEUTRAL_EQUIPMENT_RECOMMENDATION: EquipmentRecommendation = {
  tier: 'neutral',
  reasons: [],
  specificity: 'broad_pool',
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

/**
 * Browse-sort rank per reason — lower ranks list first within the same tier.
 * Intentionally differs from `EQUIPMENT_RECOMMENDATION_REASONS` array order:
 * needs (class-required, tools, foci) before nice-to-have (starting options, proficiency).
 */
export const EQUIPMENT_RECOMMENDATION_REASON_RANK = {
  classRequired: 0,
  classToolNeed: 1,
  selectedToolProficiency: 2,
  spellcastingFocus: 3,
  startingEquipment: 4,
  unresolvedToolProficiencyChoice: 5,
  startingEquipmentChoice: 6,
  classToolCategory: 7,
  availableInStartingOption: 8,
  classSuggested: 9,
  proficient: 10,
  notProficient: 11,
} as const satisfies Record<EquipmentRecommendationReason, number>

/** Best (lowest) reason rank for browse ordering; empty reasons sort after reasoned peers. */
export function getBestEquipmentRecommendationReasonRank(
  reasons: readonly EquipmentRecommendationReason[],
): number {
  if (reasons.length === 0) return Number.POSITIVE_INFINITY
  return Math.min(...reasons.map((reason) => EQUIPMENT_RECOMMENDATION_REASON_RANK[reason]))
}

/** Comparator over specificity — exact first, broad pool last. */
export function compareEquipmentRecommendationSpecificity(
  left: EquipmentRecommendationSpecificity,
  right: EquipmentRecommendationSpecificity,
): number {
  return (
    EQUIPMENT_RECOMMENDATION_SPECIFICITY_RANK[left] -
    EQUIPMENT_RECOMMENDATION_SPECIFICITY_RANK[right]
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

/** Best (most specific) specificity for browse ordering within the same tier. */
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
