import { describe, expect, it } from 'vitest'

import { levelValidationMessages } from '../../primitives/level-messages'
import {
  computeStartingWealthSparsePatch,
  mergeStartingWealthRulesPatch,
  resolveStartingWealthRules,
  resolveStartingWealthTierForBuilder,
  startingWealthRulesSchema,
  startingWealthTierForLevel,
  startingWealthTierSchema,
  type StartingWealthTier,
} from './starting-wealth'
import {
  MINIMAL_TIER_A_ID,
  MINIMAL_TIER_B_ID,
  MINIMAL_TIER_C_ID,
  minimalStartingWealthSeed,
} from '../../../test/fixtures/starting-wealth-minimal'
import { patchTierById } from '../../../test/helpers/patch-tier'

describe('startingWealthTierSchema', () => {
  it('defaults includeNormalStartingEquipment to true', () => {
    expect(
      startingWealthTierSchema.parse(minimalStartingWealthSeed.tiers[0])
        .includeNormalStartingEquipment,
    ).toBe(true)
  })
})

describe('startingWealthRulesSchema', () => {
  it('accepts non-overlapping tier ranges', () => {
    expect(startingWealthRulesSchema.parse(minimalStartingWealthSeed).tiers).toHaveLength(3)
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

  it('rejects gapped tier ranges', () => {
    const result = startingWealthRulesSchema.safeParse({
      name: 'Standard Starting Wealth',
      scope: { kind: 'standard' },
      tiers: [
        { id: 'a', label: 'A', minLevel: 1, maxLevel: 1, magicItemGrants: [] },
        { id: 'b', label: 'B', minLevel: 2, maxLevel: 4, magicItemGrants: [] },
        { id: 'c', label: 'C', minLevel: 6, maxLevel: 9, magicItemGrants: [] },
      ],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(levelValidationMessages.rangeGap({ level: 5 }))
    }
  })

  it('uses shared overlap message copy', () => {
    const result = startingWealthRulesSchema.safeParse({
      name: 'Standard Starting Wealth',
      scope: { kind: 'standard' },
      tiers: [
        { id: 'a', label: 'A', minLevel: 1, maxLevel: 5, magicItemGrants: [] },
        { id: 'b', label: 'B', minLevel: 4, maxLevel: 10, magicItemGrants: [] },
      ],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        levelValidationMessages.rangeOverlap({ otherLabel: 'Levels 1–5' }),
      )
    }
  })
})

describe('resolveStartingWealthRules', () => {
  it('returns the seed when no patch is provided', () => {
    expect(resolveStartingWealthRules(minimalStartingWealthSeed)).toEqual(minimalStartingWealthSeed)
  })

  it('replaces tiers wholesale when patched', () => {
    const patchedTiers: StartingWealthTier[] = patchTierById(
      minimalStartingWealthSeed,
      MINIMAL_TIER_A_ID,
      { includeNormalStartingEquipment: false },
    )

    const resolved = resolveStartingWealthRules(minimalStartingWealthSeed, { tiers: patchedTiers })

    expect(
      resolved.tiers.find((tier) => tier.id === MINIMAL_TIER_A_ID)?.includeNormalStartingEquipment,
    ).toBe(false)
    expect(resolved.name).toBe(minimalStartingWealthSeed.name)
  })

  it('overrides table metadata without touching tiers', () => {
    const resolved = resolveStartingWealthRules(minimalStartingWealthSeed, {
      name: 'Custom table name',
    })

    expect(resolved.name).toBe('Custom table name')
    expect(resolved.tiers).toEqual(minimalStartingWealthSeed.tiers)
  })
})

describe('computeStartingWealthSparsePatch', () => {
  it('returns undefined when resolved rules match the seed', () => {
    expect(
      computeStartingWealthSparsePatch(minimalStartingWealthSeed, minimalStartingWealthSeed),
    ).toBeUndefined()
  })

  it('returns only fields that differ from the seed', () => {
    const patchedTiers = patchTierById(minimalStartingWealthSeed, MINIMAL_TIER_A_ID, {
      includeNormalStartingEquipment: false,
    })
    const resolved = resolveStartingWealthRules(minimalStartingWealthSeed, { tiers: patchedTiers })

    expect(computeStartingWealthSparsePatch(resolved, minimalStartingWealthSeed)).toEqual({
      tiers: patchedTiers,
    })
  })

  it('returns undefined when resolved tiers match the seed after form round-trip field order', () => {
    expect(
      computeStartingWealthSparsePatch(minimalStartingWealthSeed, minimalStartingWealthSeed),
    ).toBeUndefined()
  })
})

describe('mergeStartingWealthRulesPatch', () => {
  it('layers sparse patches without dropping prior overrides', () => {
    const patchedTiers = patchTierById(minimalStartingWealthSeed, MINIMAL_TIER_A_ID, {
      includeNormalStartingEquipment: false,
    })

    const merged = mergeStartingWealthRulesPatch(
      { tiers: patchedTiers },
      { name: 'Custom table name' },
    )

    expect(merged).toEqual({
      name: 'Custom table name',
      tiers: patchedTiers,
    })
  })
})

describe('startingWealthTierForLevel', () => {
  it('returns the matching tier for a level', () => {
    expect(startingWealthTierForLevel(minimalStartingWealthSeed, 3)?.id).toBe(MINIMAL_TIER_B_ID)
  })

  it('returns undefined when no tier matches', () => {
    expect(startingWealthTierForLevel(minimalStartingWealthSeed, 20)).toBeUndefined()
  })
})

describe('resolveStartingWealthTierForBuilder', () => {
  it('falls back to the highest tier at or below the selected level', () => {
    expect(resolveStartingWealthTierForBuilder(minimalStartingWealthSeed, 7)?.id).toBe(
      MINIMAL_TIER_C_ID,
    )
  })
})
