import { describe, expect, it } from 'vitest'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'

import { buildRulesSchemaForSurface } from './character-configuration-form-fields'
import {
  buildStartingWealthPatchInput,
  defaultStartingWealthTierBonusGoldFormValues,
  formatStartingWealthTierSummary,
  mapStartingWealthToFormValues,
} from './starting-wealth-form-values'
import { startingWealthFormSchema } from './starting-wealth-form-fields'

const SEED = getStandardStartingWealthRules('srd-cc-5.2.1')
const configRulesSchema = buildRulesSchemaForSurface('config')

describe('formatStartingWealthTierSummary', () => {
  it('formats a single-level tier as Level N', () => {
    const initiateTier = mapStartingWealthToFormValues(SEED).tiers.find(
      (tier) => tier.label === 'Initiate',
    )
    expect(initiateTier).toBeDefined()

    expect(formatStartingWealthTierSummary(initiateTier!)).toBe('Level 1')
  })

  it('formats hero tier with level range, average bonus gold, and grant count', () => {
    const heroTier = mapStartingWealthToFormValues(SEED).tiers.find((tier) => tier.label === 'Hero')
    expect(heroTier).toBeDefined()

    expect(formatStartingWealthTierSummary(heroTier!)).toBe('Levels 5–10 · Avg 637.5 GP · 2 grants')
  })

  it('formats tiers with grants but no bonus gold', () => {
    const adventurerTier = mapStartingWealthToFormValues(SEED).tiers.find(
      (tier) => tier.label === 'Adventurer',
    )
    expect(adventurerTier).toBeDefined()

    expect(formatStartingWealthTierSummary(adventurerTier!)).toBe('Levels 2–4 · 1 grant')
  })

  it('formats average bonus gold with grouped thousands separators', () => {
    expect(
      formatStartingWealthTierSummary({
        ...mapStartingWealthToFormValues(SEED).tiers[0]!,
        bonusGoldEnabled: true,
        bonusGold: {
          ...defaultStartingWealthTierBonusGoldFormValues(),
          baseGp: 21_369.5,
          formula: { count: 1, faces: 10, modifier: { operator: '×', amount: 1 } },
        },
      }),
    ).toBe('Level 1 · Avg 21,375 GP')
  })

  it('tolerates missing bonusGold while bonus gold is enabled', () => {
    const tier = mapStartingWealthToFormValues(SEED).tiers[0]!

    expect(
      formatStartingWealthTierSummary({
        ...tier,
        bonusGoldEnabled: true,
        bonusGold: undefined as unknown as typeof tier.bonusGold,
      }),
    ).toContain('Avg')
  })
})

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
  it('does not validate tier overlap at row schema level', () => {
    const form = mapStartingWealthToFormValues(SEED)
    form.tiers[1] = { ...form.tiers[1]!, minLevel: 1, maxLevel: 4 }

    expect(startingWealthFormSchema.safeParse(form).success).toBe(true)
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

describe('configRulesSchema starting wealth tiers', () => {
  function baseConfigForm() {
    return mapStartingWealthToFormValues(SEED)
  }

  it('rejects overlapping tier ranges via parent refine', () => {
    const startingWealth = baseConfigForm()
    startingWealth.tiers[1] = { ...startingWealth.tiers[1]!, minLevel: 1, maxLevel: 4 }

    const result = configRulesSchema.safeParse({
      startingLevel: 1,
      maxCharacterLevel: 20,
      extendedProgressionEnabled: false,
      importedCharactersPolicy: 'disabled',
      allowedCharacterCreatureTypes: ['humanoid'],
      startingWealth,
    })

    expect(result.success).toBe(false)
  })

  it('rejects gapped tier ranges via parent refine', () => {
    const startingWealth = baseConfigForm()
    startingWealth.tiers[2] = { ...startingWealth.tiers[2]!, minLevel: 6, maxLevel: 10 }

    const result = configRulesSchema.safeParse({
      startingLevel: 1,
      maxCharacterLevel: 20,
      extendedProgressionEnabled: false,
      importedCharactersPolicy: 'disabled',
      allowedCharacterCreatureTypes: ['humanoid'],
      startingWealth,
    })

    expect(result.success).toBe(false)
  })
})
