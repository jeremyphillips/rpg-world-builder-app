import { describe, expect, it } from 'vitest'

import {
  startingWealthBodySchema,
  startingWealthTierForLevel,
  startingWealthTierSchema,
  type StartingWealthTier,
} from './starting-wealth'

const BASE_TIERS: StartingWealthTier[] = [
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
]

describe('startingWealthTierSchema', () => {
  it('defaults includeNormalStartingEquipment to true', () => {
    expect(startingWealthTierSchema.parse(BASE_TIERS[0]).includeNormalStartingEquipment).toBe(true)
  })
})

describe('startingWealthBodySchema', () => {
  it('accepts non-overlapping tier ranges', () => {
    expect(
      startingWealthBodySchema.parse({
        name: 'Standard Starting Wealth',
        scope: { kind: 'standard' },
        tiers: BASE_TIERS,
      }).tiers,
    ).toHaveLength(3)
  })

  it('rejects overlapping tier ranges', () => {
    expect(
      startingWealthBodySchema.safeParse({
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

describe('startingWealthTierForLevel', () => {
  it('returns the matching tier for a level', () => {
    expect(startingWealthTierForLevel({ tiers: BASE_TIERS }, 3)?.id).toBe('levels-2-4')
  })

  it('returns undefined when no tier matches', () => {
    expect(startingWealthTierForLevel({ tiers: BASE_TIERS }, 20)).toBeUndefined()
  })
})
