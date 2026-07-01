import { describe, expect, it } from 'vitest'

import {
  resolveStartingWealthRules,
  startingWealthRulesSchema,
  type StartingWealthRules,
} from '../rules/starting-wealth'
import { resolveCharacterCreationPatch } from './campaign-character-creation-patch'

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
