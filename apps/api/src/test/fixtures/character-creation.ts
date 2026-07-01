import type { UpdateCampaignCharacterCreationInput } from '@rpg/contracts'

import { updateCharacterCreationPatch } from '../../features/vocabulary/ruleset-patch/ruleset-patch.service'
import { patchInitiateStartingWealthTier, withLastTierMaxLevel } from './starting-wealth'

export const EXTENDED_PROGRESSION_AT_30 = {
  maxCharacterLevel: 20,
  extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
} as const

/** Catalog-aligned character-creation patch shapes for integration tests. */
export const characterCreationScenarios = {
  default: () => ({}) satisfies UpdateCampaignCharacterCreationInput,

  extendedAt30: () =>
    ({
      progression: EXTENDED_PROGRESSION_AT_30,
    }) satisfies UpdateCampaignCharacterCreationInput,

  extendedAt30WithTiers: () =>
    ({
      progression: EXTENDED_PROGRESSION_AT_30,
      startingWealth: { tiers: withLastTierMaxLevel(30) },
    }) satisfies UpdateCampaignCharacterCreationInput,

  initiateWithoutClassEquipment: () =>
    ({
      startingWealth: {
        tiers: patchInitiateStartingWealthTier({ includeNormalStartingEquipment: false }),
      },
    }) satisfies UpdateCampaignCharacterCreationInput,
} as const

/** Enables extended progression to 30 with matching starting wealth tier coverage. */
export async function enableExtendedProgressionAt30(campaignId: string): Promise<void> {
  await updateCharacterCreationPatch(campaignId, characterCreationScenarios.extendedAt30WithTiers())
}
