import type { Campaign, UpdateCampaignInput } from '@rpg/contracts'

import type { FlavorValues, IdentityValues } from './campaign-profile-form-fields'
import {
  primaryWorldIdFromSettingsValue,
  primaryWorldIdToSettingsValue,
  type WorldSettingsValues,
} from './world-settings-form-fields'

type CampaignProfileSettingsValues = IdentityValues & FlavorValues & WorldSettingsValues

/** Maps a `Campaign` document to the flat shape used by the settings form. */
export function mapCampaignToSettingsValues(campaign: Campaign): CampaignProfileSettingsValues {
  const flavor = campaign.configuration.flavor

  return {
    name: campaign.identity.name,
    description: campaign.identity.description ?? '',
    banner: [],
    playStyle: flavor?.playStyle,
    mood: flavor?.mood,
    magicLevel: flavor?.magicLevel,
    difficulty: flavor?.difficulty,
    primaryWorldId: primaryWorldIdToSettingsValue(campaign.configuration.settings?.primaryWorldId),
  }
}

/** Builds the API patch payload from validated settings form values. */
export function buildUpdateCampaignInput(
  values: CampaignProfileSettingsValues,
  imageKey?: string,
): UpdateCampaignInput {
  const primaryWorldId = primaryWorldIdFromSettingsValue(values.primaryWorldId)

  return {
    name: values.name,
    description: values.description,
    ...(imageKey !== undefined && { imageKey }),
    flavor: {
      playStyle: values.playStyle,
      mood: values.mood,
      magicLevel: values.magicLevel,
      difficulty: values.difficulty,
    },
    ...(primaryWorldId !== undefined && {
      settings: { primaryWorldId },
    }),
  }
}
