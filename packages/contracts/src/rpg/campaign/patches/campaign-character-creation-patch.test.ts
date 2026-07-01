import { describe, expect, it } from 'vitest'

import {
  resolveStartingWealthRules,
  startingWealthRulesSchema,
  type StartingWealthRules,
} from '../rules/starting-wealth'
import {
  resolveCharacterCreationPatch,
  safeParseMergedCharacterCreationPatch,
  updateCampaignCharacterCreationInputSchema,
} from './campaign-character-creation-patch'

const STARTING_WEALTH_SEED: StartingWealthRules = {
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
  ],
}

describe('resolveCharacterCreationPatch', () => {
  it('keeps standard max level separate from extended progression on resolved reads', () => {
    const resolved = resolveCharacterCreationPatch(
      {
        progression: {
          maxCharacterLevel: 20,
          extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
        },
      },
      STARTING_WEALTH_SEED,
    )

    expect(resolved.progression).toEqual({
      maxCharacterLevel: 20,
      extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
    })
  })

  it('merges starting wealth patch onto the catalog seed', () => {
    const patchedTiers = STARTING_WEALTH_SEED.tiers.map((tier) =>
      tier.id === 'level-1' ? { ...tier, includeNormalStartingEquipment: false } : tier,
    )

    const resolved = resolveCharacterCreationPatch(
      { startingWealth: { tiers: patchedTiers } },
      STARTING_WEALTH_SEED,
    )

    expect(resolved.startingWealth).toEqual(
      resolveStartingWealthRules(STARTING_WEALTH_SEED, { tiers: patchedTiers }),
    )
    expect(
      resolved.startingWealth.tiers.find((tier) => tier.id === 'level-1')
        ?.includeNormalStartingEquipment,
    ).toBe(false)
  })

  it('returns the seed starting wealth when no patch override exists', () => {
    const resolved = resolveCharacterCreationPatch(undefined, STARTING_WEALTH_SEED)

    expect(resolved.startingWealth).toEqual(startingWealthRulesSchema.parse(STARTING_WEALTH_SEED))
  })
})

describe('updateCampaignCharacterCreationInputSchema', () => {
  it('rejects gapped starting wealth tiers in the request body', () => {
    const result = updateCampaignCharacterCreationInputSchema.safeParse({
      startingWealth: {
        tiers: [
          { id: 'a', label: 'A', minLevel: 1, maxLevel: 1, magicItemGrants: [] },
          { id: 'b', label: 'B', minLevel: 3, maxLevel: 4, magicItemGrants: [] },
        ],
      },
    })

    expect(result.success).toBe(false)
  })

  it('rejects tiers whose max exceeds effective max in the same request', () => {
    const result = updateCampaignCharacterCreationInputSchema.safeParse({
      startingWealth: {
        tiers: [{ id: 'a', label: 'A', minLevel: 1, maxLevel: 25, magicItemGrants: [] }],
      },
    })

    expect(result.success).toBe(false)
  })
})

describe('safeParseMergedCharacterCreationPatch', () => {
  it('rejects merged patch when resolved tiers do not cover extended max', () => {
    const result = safeParseMergedCharacterCreationPatch(
      {
        progression: {
          maxCharacterLevel: 20,
          extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
        },
      },
      STARTING_WEALTH_SEED,
    )

    expect(result.success).toBe(false)
  })

  it('accepts merged patch when tiers cover extended max', () => {
    const tiers = STARTING_WEALTH_SEED.tiers.map((tier) =>
      tier.id === 'levels-2-4' ? { ...tier, maxLevel: 30 } : tier,
    )

    const result = safeParseMergedCharacterCreationPatch(
      {
        progression: {
          maxCharacterLevel: 20,
          extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
        },
        startingWealth: { tiers },
      },
      STARTING_WEALTH_SEED,
    )

    expect(result.success).toBe(true)
  })
})
