import { describe, expect, it } from 'vitest'

import { resolveStartingWealthRules, startingWealthRulesSchema } from '../rules/starting-wealth'
import { resolveCharacterCreationPatch } from './campaign-character-creation-patch'
import { extendedProgressionAt } from '../../../test/fixtures/character-creation-patch'
import {
  MINIMAL_TIER_A_ID,
  minimalStartingWealthSeed,
} from '../../../test/fixtures/starting-wealth-minimal'
import { patchTierById } from '../../../test/helpers/patch-tier'

describe('resolveCharacterCreationPatch', () => {
  it('keeps standard max level separate from extended progression on resolved reads', () => {
    const resolved = resolveCharacterCreationPatch(
      extendedProgressionAt(30),
      minimalStartingWealthSeed,
    )

    expect(resolved.progression).toEqual({
      maxCharacterLevel: 20,
      extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
    })
  })

  it('merges starting wealth patch onto the catalog seed', () => {
    const patchedTiers = patchTierById(minimalStartingWealthSeed, MINIMAL_TIER_A_ID, {
      includeNormalStartingEquipment: false,
    })

    const resolved = resolveCharacterCreationPatch(
      { startingWealth: { tiers: patchedTiers } },
      minimalStartingWealthSeed,
    )

    expect(resolved.startingWealth).toEqual(
      resolveStartingWealthRules(minimalStartingWealthSeed, { tiers: patchedTiers }),
    )
    expect(
      resolved.startingWealth.tiers.find((tier) => tier.id === MINIMAL_TIER_A_ID)
        ?.includeNormalStartingEquipment,
    ).toBe(false)
  })

  it('returns the seed starting wealth when no patch override exists', () => {
    const resolved = resolveCharacterCreationPatch(undefined, minimalStartingWealthSeed)

    expect(resolved.startingWealth).toEqual(
      startingWealthRulesSchema.parse(minimalStartingWealthSeed),
    )
  })

  it('resolves subclassing defaults and overrides', () => {
    expect(resolveCharacterCreationPatch(undefined, minimalStartingWealthSeed).subclasses).toEqual({
      enabled: true,
    })
    expect(
      resolveCharacterCreationPatch({ subclasses: { enabled: false } }, minimalStartingWealthSeed)
        .subclasses,
    ).toEqual({ enabled: false })
  })
})
