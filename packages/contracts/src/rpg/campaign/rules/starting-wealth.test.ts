import { describe, expect, it } from 'vitest'

import {
  resolveStartingWealthRules,
  startingWealthRulesSchema,
  startingWealthTierForLevel,
  startingWealthTierSchema,
  type StartingWealthRules,
  type StartingWealthTier,
} from './starting-wealth'

const SEED: StartingWealthRules = {
  name: 'Standard Starting Wealth',
  scope: { kind: 'standard' },
  tiers: [
    {
      id: 'level-1',
      label: 'Level 1',
      minLevel: 1,
      maxLevel: 1,
      includeNormalStartingEquipment: true,
      magicItemGrants: [],
    },
    {
      id: 'levels-2-4',
      label: 'Levels 2–4',
      minLevel: 2,
      maxLevel: 4,
      includeNormalStartingEquipment: true,
      magicItemGrants: [{ rarity: 'common', quantity: 1 }],
    },
    {
      id: 'levels-5-10',
      label: 'Levels 5–10',
      minLevel: 5,
      maxLevel: 10,
      includeNormalStartingEquipment: true,
      bonusGold: {
        baseGp: 500,
        formula: {
          kind: 'dice',
          dice: { count: 1, faces: 10 },
          multiplier: 25,
          currency: 'gp',
        },
      },
      magicItemGrants: [
        { rarity: 'common', quantity: 1 },
        { rarity: 'uncommon', quantity: 1 },
      ],
    },
  ],
}

describe('startingWealthTierSchema', () => {
  it('defaults includeNormalStartingEquipment to true', () => {
    expect(startingWealthTierSchema.parse(SEED.tiers[0]).includeNormalStartingEquipment).toBe(true)
  })
})

describe('startingWealthRulesSchema', () => {
  it('accepts non-overlapping tier ranges', () => {
    expect(startingWealthRulesSchema.parse(SEED).tiers).toHaveLength(3)
  })

  it('rejects overlapping tier ranges', () => {
    expect(
      startingWealthRulesSchema.safeParse({
        name: 'Standard Starting Wealth',
        scope: { kind: 'standard' },
        tiers: [
          { id: 'a', label: 'A', minLevel: 1, maxLevel: 5, magicItemGrants: [] },
          { id: 'b', label: 'B', minLevel: 5, maxLevel: 10, magicItemGrants: [] },
        ],
      }).success,
    ).toBe(false)
  })
})

describe('resolveStartingWealthRules', () => {
  it('returns the seed when no patch is provided', () => {
    expect(resolveStartingWealthRules(SEED)).toEqual(SEED)
  })

  it('replaces tiers wholesale when patched', () => {
    const patchedTiers: StartingWealthTier[] = SEED.tiers.map((tier) =>
      tier.id === 'level-1' ? { ...tier, includeNormalStartingEquipment: false } : tier,
    )

    const resolved = resolveStartingWealthRules(SEED, { tiers: patchedTiers })

    expect(
      resolved.tiers.find((tier) => tier.id === 'level-1')?.includeNormalStartingEquipment,
    ).toBe(false)
    expect(resolved.name).toBe(SEED.name)
  })

  it('overrides table metadata without touching tiers', () => {
    const resolved = resolveStartingWealthRules(SEED, { name: 'Custom table name' })

    expect(resolved.name).toBe('Custom table name')
    expect(resolved.tiers).toEqual(SEED.tiers)
  })
})

describe('startingWealthTierForLevel', () => {
  it('returns the matching tier for a level', () => {
    expect(startingWealthTierForLevel(SEED, 3)?.id).toBe('levels-2-4')
  })

  it('returns undefined when no tier matches', () => {
    expect(startingWealthTierForLevel(SEED, 20)).toBeUndefined()
  })
})
