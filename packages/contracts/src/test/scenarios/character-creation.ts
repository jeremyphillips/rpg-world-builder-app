import type { CampaignCharacterCreationPatch } from '../../rpg/campaign/patches/campaign-character-creation-patch'
import { extendedProgressionAt } from '../fixtures/character-creation-patch'
import {
  MINIMAL_TIER_A_ID,
  minimalStartingWealthSeed,
  minimalStartingWealthSeedCoveringStandardMax,
} from '../fixtures/starting-wealth-minimal'
import { patchTierById, withLastTierMaxLevel } from '../helpers/patch-tier'

/** Named character-creation patch input shapes for validation matrices. */
export const characterCreationScenarios = {
  default: () => ({}) satisfies CampaignCharacterCreationPatch,

  extendedAt30: () => extendedProgressionAt(30),

  extendedAt30WithTiers: () =>
    ({
      ...extendedProgressionAt(30),
      startingWealth: { tiers: withLastTierMaxLevel(minimalStartingWealthSeed, 30) },
    }) satisfies CampaignCharacterCreationPatch,

  firstTierWithoutClassEquipment: () =>
    ({
      startingWealth: {
        tiers: patchTierById(minimalStartingWealthSeedCoveringStandardMax, MINIMAL_TIER_A_ID, {
          includeNormalStartingEquipment: false,
        }),
      },
    }) satisfies CampaignCharacterCreationPatch,
} as const
