import { describe, expect, it } from 'vitest'

import {
  compareEquipmentRecommendationSpecificity,
  EQUIPMENT_RECOMMENDATION_SPECIFICITY_PRECEDENCE,
  EQUIPMENT_RECOMMENDATION_TIER_PRECEDENCE,
  EQUIPMENT_RECOMMENDATION_TIERS,
  equipmentRecommendationRuleSchema,
  getBestEquipmentRecommendationSpecificity,
  isRecommendedEquipmentTier,
} from './equipment-recommendation'

describe('equipment recommendation tiers', () => {
  it('assigns a unique derivation precedence to every tier', () => {
    const ranks = EQUIPMENT_RECOMMENDATION_TIERS.map(
      (tier) => EQUIPMENT_RECOMMENDATION_TIER_PRECEDENCE[tier],
    )
    expect(new Set(ranks).size).toBe(EQUIPMENT_RECOMMENDATION_TIERS.length)
  })

  it('limits Recommended-tab membership to essential and strong', () => {
    expect(isRecommendedEquipmentTier('essential')).toBe(true)
    expect(isRecommendedEquipmentTier('strong')).toBe(true)
    expect(isRecommendedEquipmentTier('compatible')).toBe(false)
    expect(isRecommendedEquipmentTier('neutral')).toBe(false)
  })

  it('prefers essential over strong over compatible over neutral when collapsing evidence', () => {
    expect(EQUIPMENT_RECOMMENDATION_TIER_PRECEDENCE.essential).toBeLessThan(
      EQUIPMENT_RECOMMENDATION_TIER_PRECEDENCE.strong,
    )
    expect(EQUIPMENT_RECOMMENDATION_TIER_PRECEDENCE.strong).toBeLessThan(
      EQUIPMENT_RECOMMENDATION_TIER_PRECEDENCE.compatible,
    )
    expect(EQUIPMENT_RECOMMENDATION_TIER_PRECEDENCE.compatible).toBeLessThan(
      EQUIPMENT_RECOMMENDATION_TIER_PRECEDENCE.neutral,
    )
  })
})

describe('equipment recommendation specificity precedence', () => {
  it('assigns a unique derivation precedence to every specificity', () => {
    const ranks = Object.values(EQUIPMENT_RECOMMENDATION_SPECIFICITY_PRECEDENCE)
    expect(new Set(ranks).size).toBe(ranks.length)
  })

  it('prefers exact over narrow_pool over broad_pool when collapsing evidence', () => {
    expect(compareEquipmentRecommendationSpecificity('exact', 'narrow_pool')).toBeLessThan(0)
    expect(compareEquipmentRecommendationSpecificity('narrow_pool', 'broad_pool')).toBeLessThan(0)
    expect(compareEquipmentRecommendationSpecificity('broad_pool', 'exact')).toBeGreaterThan(0)
  })

  it('returns the best specificity from evidence and collapsed recommendations', () => {
    expect(
      getBestEquipmentRecommendationSpecificity([
        {
          reason: 'unresolvedToolProficiencyChoice',
          tier: 'strong',
          specificity: 'broad_pool',
        },
        {
          reason: 'availableInStartingOption',
          tier: 'strong',
          specificity: 'exact',
        },
      ]),
    ).toBe('exact')
    expect(
      getBestEquipmentRecommendationSpecificity({
        tier: 'strong',
        reasons: ['startingEquipment'],
        specificity: 'exact',
      }),
    ).toBe('exact')
    expect(getBestEquipmentRecommendationSpecificity([])).toBe('broad_pool')
  })
})

describe('equipmentRecommendationRuleSchema', () => {
  it('parses explicit and filtered pool matchers with tag, minLevel, and label', () => {
    expect(
      equipmentRecommendationRuleSchema.parse({
        match: { source: 'explicit', equipmentSlugs: ['spellbook'] },
        tag: 'arcana',
        minLevel: 2,
        label: 'Spellbook',
      }),
    ).toMatchObject({ tag: 'arcana', minLevel: 2, label: 'Spellbook' })

    expect(
      equipmentRecommendationRuleSchema.safeParse({
        match: { source: 'filtered', equipmentKind: 'tool', toolCategory: 'thieves' },
      }).success,
    ).toBe(true)
  })

  it('rejects rules without a matcher', () => {
    expect(equipmentRecommendationRuleSchema.safeParse({ label: 'Spellbook' }).success).toBe(false)
  })
})
