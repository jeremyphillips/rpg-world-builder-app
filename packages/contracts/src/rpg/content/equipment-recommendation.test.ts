import { describe, expect, it } from 'vitest'

import {
  compareEquipmentRecommendationTiers,
  EQUIPMENT_RECOMMENDATION_REASON_RANK,
  EQUIPMENT_RECOMMENDATION_TIER_RANK,
  EQUIPMENT_RECOMMENDATION_TIERS,
  equipmentRecommendationRuleSchema,
  getBestEquipmentRecommendationReasonRank,
  isRecommendedEquipmentTier,
} from './equipment-recommendation'

describe('equipment recommendation tiers', () => {
  it('assigns a unique rank to every tier', () => {
    const ranks = EQUIPMENT_RECOMMENDATION_TIERS.map(
      (tier) => EQUIPMENT_RECOMMENDATION_TIER_RANK[tier],
    )
    expect(new Set(ranks).size).toBe(EQUIPMENT_RECOMMENDATION_TIERS.length)
  })

  it('limits Recommended-tab membership to essential and strong', () => {
    expect(isRecommendedEquipmentTier('essential')).toBe(true)
    expect(isRecommendedEquipmentTier('strong')).toBe(true)
    expect(isRecommendedEquipmentTier('compatible')).toBe(false)
    expect(isRecommendedEquipmentTier('neutral')).toBe(false)
    expect(isRecommendedEquipmentTier('notRecommended')).toBe(false)
  })

  it('orders tiers essential-first and notRecommended-last', () => {
    expect(compareEquipmentRecommendationTiers('essential', 'strong')).toBeLessThan(0)
    expect(compareEquipmentRecommendationTiers('notRecommended', 'neutral')).toBeGreaterThan(0)
    expect(compareEquipmentRecommendationTiers('compatible', 'compatible')).toBe(0)
  })
})

describe('equipment recommendation reason ranks', () => {
  it('assigns a unique rank to every reason', () => {
    const ranks = Object.values(EQUIPMENT_RECOMMENDATION_REASON_RANK)
    expect(new Set(ranks).size).toBe(ranks.length)
  })

  it('ranks needs before nice-to-have reasons', () => {
    expect(EQUIPMENT_RECOMMENDATION_REASON_RANK.classRequired).toBeLessThan(
      EQUIPMENT_RECOMMENDATION_REASON_RANK.startingEquipment,
    )
    expect(EQUIPMENT_RECOMMENDATION_REASON_RANK.classToolNeed).toBeLessThan(
      EQUIPMENT_RECOMMENDATION_REASON_RANK.startingEquipment,
    )
    expect(EQUIPMENT_RECOMMENDATION_REASON_RANK.spellcastingFocus).toBeLessThan(
      EQUIPMENT_RECOMMENDATION_REASON_RANK.classSuggested,
    )
  })

  it('returns the best reason rank and treats empty reasons as neutral', () => {
    expect(getBestEquipmentRecommendationReasonRank(['classRequired'])).toBe(0)
    expect(getBestEquipmentRecommendationReasonRank(['proficient', 'classToolNeed'])).toBe(
      EQUIPMENT_RECOMMENDATION_REASON_RANK.classToolNeed,
    )
    expect(getBestEquipmentRecommendationReasonRank([])).toBe(Number.POSITIVE_INFINITY)
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
