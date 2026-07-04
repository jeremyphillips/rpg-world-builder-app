import { describe, it } from 'vitest'

import { levelValidationMessages } from '../../primitives/level-messages'
import {
  safeParseMergedCharacterCreationPatch,
  updateCampaignCharacterCreationInputSchema,
} from './campaign-character-creation-patch'
import { expectParseFailure, expectParseSuccess } from '../../../test/helpers/expect-zod-result'
import { patchTierById } from '../../../test/helpers/patch-tier'
import { characterCreationScenarios } from '../../../test/scenarios/character-creation'
import {
  MINIMAL_TIER_B_ID,
  minimalStartingWealthSeed,
  minimalStartingWealthSeedCoveringStandardMax,
} from '../../../test/fixtures/starting-wealth-minimal'

describe('safeParseMergedCharacterCreationPatch', () => {
  it.each([
    {
      name: 'rejects when resolved tiers do not cover extended max',
      patch: characterCreationScenarios.extendedAt30(),
      expected: { message: levelValidationMessages.rangeEndAt({ expected: 30 }) },
    },
    {
      name: 'accepts when tiers cover extended max',
      patch: characterCreationScenarios.extendedAt30WithTiers(),
      expected: null,
    },
    {
      name: 'accepts default patch against minimal seed',
      patch: characterCreationScenarios.default(),
      expected: null,
    },
    {
      name: 'accepts first-tier equipment override when tiers still cover standard max',
      patch: characterCreationScenarios.firstTierWithoutClassEquipment(),
      expected: null,
    },
  ])('$name', ({ patch, expected }) => {
    const result = safeParseMergedCharacterCreationPatch(
      patch,
      minimalStartingWealthSeedCoveringStandardMax,
    )

    if (expected === null) {
      expectParseSuccess(result)
      return
    }

    expectParseFailure(result, expected)
  })
})

describe('updateCampaignCharacterCreationInputSchema', () => {
  it.each([
    {
      name: 'rejects gapped starting wealth tiers in the request body',
      input: {
        startingWealth: {
          tiers: [
            { id: 'a', label: 'A', minLevel: 1, maxLevel: 1, magicItemGrants: [] },
            { id: 'b', label: 'B', minLevel: 3, maxLevel: 4, magicItemGrants: [] },
          ],
        },
      },
      expected: { message: levelValidationMessages.rangeGap({ level: 2 }) },
    },
    {
      name: 'rejects tiers whose max exceeds effective max in the same request',
      input: {
        startingWealth: {
          tiers: [{ id: 'a', label: 'A', minLevel: 1, maxLevel: 25, magicItemGrants: [] }],
        },
      },
      expected: { message: levelValidationMessages.outOfBounds({ maxLevel: 20 }) },
    },
    {
      name: 'rejects starting level above effective max in the same request',
      input: {
        startingLevel: 25,
        progression: { maxCharacterLevel: 20 },
      },
      expected: {
        path: ['startingLevel'],
        message: levelValidationMessages.startingLevelExceedsMax(),
      },
    },
    {
      name: 'rejects starting level above extended max in the same request',
      input: {
        startingLevel: 31,
        progression: {
          maxCharacterLevel: 20,
          extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
        },
      },
      expected: {
        path: ['startingLevel'],
        message: levelValidationMessages.startingLevelExceedsMax(),
      },
    },
    {
      name: 'rejects extended progression when request tiers do not cover extended max',
      input: {
        ...characterCreationScenarios.extendedAt30(),
        startingWealth: {
          tiers: patchTierById(minimalStartingWealthSeed, MINIMAL_TIER_B_ID, { maxLevel: 4 }),
        },
      },
      expected: { message: levelValidationMessages.rangeEndAt({ expected: 30 }) },
    },
    {
      name: 'accepts extended progression when request tiers cover extended max',
      input: characterCreationScenarios.extendedAt30WithTiers(),
      expected: null,
    },
  ])('$name', ({ input, expected }) => {
    const result = updateCampaignCharacterCreationInputSchema.safeParse(input)

    if (expected === null) {
      expectParseSuccess(result)
      return
    }

    expectParseFailure(result, expected)
  })
})
