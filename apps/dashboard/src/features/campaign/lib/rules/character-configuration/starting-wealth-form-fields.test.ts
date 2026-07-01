import { describe, expect, it } from 'vitest'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import {
  buildStartingWealthPatchInput,
  mapStartingWealthToFormValues,
} from './starting-wealth-form-values'
import { startingWealthFormSchema } from './starting-wealth-form-fields'

const SEED = getStandardStartingWealthRules('srd-cc-5.2.1')

describe('mapStartingWealthToFormValues', () => {
  it('round-trips catalog seed tiers', () => {
    const form = mapStartingWealthToFormValues(SEED)

    expect(form.name).toBe(SEED.name)
    expect(form.tiers).toHaveLength(SEED.tiers.length)
    expect(form.tiers[0]?.bonusGoldEnabled).toBe(false)
  })

  it('maps bonus gold tiers with multiply dice values', () => {
    const tierWithBonus = SEED.tiers.find(
      (tier) => tier.bonusGold !== null && tier.bonusGold !== undefined,
    )
    expect(tierWithBonus).toBeDefined()

    const formTier = mapStartingWealthToFormValues(SEED).tiers.find((tier) => tier.bonusGoldEnabled)

    expect(formTier?.bonusGold.formula.modifier).toEqual({
      operator: '×',
      amount: tierWithBonus!.bonusGold!.formula.multiplier,
    })
  })
})

describe('buildStartingWealthPatchInput', () => {
  it('returns undefined when form matches the seed', () => {
    const form = mapStartingWealthToFormValues(SEED)
    expect(buildStartingWealthPatchInput(form, SEED)).toBeUndefined()
  })

  it('emits a sparse tiers patch when a tier field changes', () => {
    const form = mapStartingWealthToFormValues(SEED)
    form.tiers = form.tiers.map((tier) =>
      tier.minLevel === 1 ? { ...tier, includeNormalStartingEquipment: false } : tier,
    )

    expect(buildStartingWealthPatchInput(form, SEED)?.tiers).toHaveLength(SEED.tiers.length)
  })

  it('emits bonusGold null when bonus gold is disabled', () => {
    const form = mapStartingWealthToFormValues(SEED)
    const bonusTierIndex = form.tiers.findIndex((tier) => tier.bonusGoldEnabled)
    expect(bonusTierIndex).toBeGreaterThan(-1)

    form.tiers = form.tiers.map((tier, index) =>
      index === bonusTierIndex ? { ...tier, bonusGoldEnabled: false } : tier,
    )

    const patch = buildStartingWealthPatchInput(form, SEED)
    expect(patch?.tiers?.[bonusTierIndex]?.bonusGold).toBeNull()
  })
})

describe('startingWealthFormSchema', () => {
  it('rejects overlapping tier ranges', () => {
    const form = mapStartingWealthToFormValues(SEED)
    form.tiers[1] = { ...form.tiers[1]!, minLevel: 1, maxLevel: 4 }

    expect(startingWealthFormSchema.safeParse(form).success).toBe(false)
  })

  it('rejects bonus gold without a multiply operator', () => {
    const form = mapStartingWealthToFormValues(SEED)
    form.tiers[0] = {
      ...form.tiers[0]!,
      bonusGoldEnabled: true,
      bonusGold: {
        ...form.tiers[0]!.bonusGold,
        formula: { count: 1, faces: 6, modifier: { operator: '+', amount: 3 } },
      },
    }

    expect(startingWealthFormSchema.safeParse(form).success).toBe(false)
  })
})
