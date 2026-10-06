import { describe, expect, it } from 'vitest'

import { equipmentSchema, getEquipmentAbilityScoreRequirements } from '../equipment'
import {
  formatAbilityScoreRequirementLabel,
  formatAbilityScoreRequirementsRestriction,
  formatUnmetAbilityScoreRequirementsDetail,
  listAbilityScoreRequirements,
  resolveUnmetAbilityScoreRequirements,
} from './ability-score-requirements'

describe('resolveUnmetAbilityScoreRequirements', () => {
  it('returns nothing when there are no requirements', () => {
    expect(resolveUnmetAbilityScoreRequirements(undefined, { str: 8 })).toEqual([])
    expect(resolveUnmetAbilityScoreRequirements({}, { str: 8 })).toEqual([])
  })

  it('treats meeting the minimum exactly as met', () => {
    expect(resolveUnmetAbilityScoreRequirements({ str: 15 }, { str: 15 })).toEqual([])
  })

  it('treats exceeding the minimum as met', () => {
    expect(resolveUnmetAbilityScoreRequirements({ str: 13 }, { str: 16 })).toEqual([])
  })

  it('returns one unmet requirement with the actual score', () => {
    expect(resolveUnmetAbilityScoreRequirements({ str: 15 }, { str: 12 })).toEqual([
      { ability: 'str', required: 15, actual: 12 },
    ])
  })

  it('returns multiple unmet requirements in ABILITY_IDS order', () => {
    expect(
      resolveUnmetAbilityScoreRequirements(
        { con: 14, str: 15, dex: 13 },
        {
          str: 12,
          dex: 10,
          con: 15,
        },
      ),
    ).toEqual([
      { ability: 'str', required: 15, actual: 12 },
      { ability: 'dex', required: 13, actual: 10 },
    ])
  })

  it('skips abilities with no known score', () => {
    expect(resolveUnmetAbilityScoreRequirements({ str: 15, dex: 13 }, { dex: 10 })).toEqual([
      { ability: 'dex', required: 13, actual: 10 },
    ])
    expect(resolveUnmetAbilityScoreRequirements({ str: 15 }, undefined)).toEqual([])
  })
})

describe('ability-score requirement copy', () => {
  it('lists requirements in ABILITY_IDS order', () => {
    expect(listAbilityScoreRequirements({ dex: 13, str: 15 })).toEqual([
      { ability: 'str', required: 15 },
      { ability: 'dex', required: 13 },
    ])
  })

  it('formats labels from the ability vocabulary', () => {
    expect(formatAbilityScoreRequirementLabel({ ability: 'str', required: 15 })).toBe(
      'Requires STR 15',
    )
    expect(formatAbilityScoreRequirementLabel({ ability: 'dex', required: 13 })).toBe(
      'Requires DEX 13',
    )
    expect(formatAbilityScoreRequirementLabel({ ability: 'con', required: 12 })).toBe(
      'Requires CON 12',
    )
  })

  it('formats the detail sentence with natural-list grammar', () => {
    expect(
      formatUnmetAbilityScoreRequirementsDetail([{ ability: 'str', required: 15, actual: 12 }]),
    ).toBe('Requires STR 15; character has STR 12.')
    expect(
      formatUnmetAbilityScoreRequirementsDetail([
        { ability: 'str', required: 15, actual: 12 },
        { ability: 'dex', required: 13, actual: 10 },
      ]),
    ).toBe('Requires STR 15 and DEX 13; character has STR 12 and DEX 10.')
  })

  it('formats compact restriction copy', () => {
    expect(formatAbilityScoreRequirementsRestriction({ str: 15 })).toBe('STR 15 required')
    expect(formatAbilityScoreRequirementsRestriction({})).toBeUndefined()
  })
})

describe('getEquipmentAbilityScoreRequirements', () => {
  const plateBody = {
    id: 'srd-cc-5.2.1:plate-armor',
    slug: 'plate-armor',
    rulesetId: 'srd-cc-5.2.1',
    source: 'system',
    status: 'published',
    campaignId: null,
    createdAt: '2024-05-21T00:00:00.000Z',
    updatedAt: '2024-05-21T00:00:00.000Z',
    kind: 'armor',
    name: 'Plate Armor',
    cost: { amount: 1500, currency: 'gp' },
    category: 'heavy',
    baseAc: 18,
    addDexModifier: false,
    stealthDisadvantage: true,
  } as const

  it('returns the authored map for armor and {} otherwise', () => {
    const plate = equipmentSchema.parse({ ...plateBody, abilityScoreRequirements: { str: 15 } })
    expect(getEquipmentAbilityScoreRequirements(plate)).toEqual({ str: 15 })

    const unarmored = equipmentSchema.parse(plateBody)
    expect(getEquipmentAbilityScoreRequirements(unarmored)).toEqual({})
  })

  it('does not surface a legacy strengthRequirement key', () => {
    const legacy = equipmentSchema.parse({ ...plateBody, strengthRequirement: 15 })

    expect(legacy).not.toHaveProperty('strengthRequirement')
    expect(getEquipmentAbilityScoreRequirements(legacy)).toEqual({})
  })
})
