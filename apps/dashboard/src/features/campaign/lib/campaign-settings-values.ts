import { z } from 'zod'
import type { Campaign, UpdateCampaignInput } from '@rpg/contracts'

import { identitySchema, rulesSchema, flavorSchema } from './campaign-fields'

export const campaignSettingsSchema = identitySchema.merge(rulesSchema).merge(flavorSchema)

export type CampaignSettingsValues = z.infer<typeof campaignSettingsSchema>

const DEFAULT_STARTING_LEVEL = 1
const DEFAULT_IMPORTED_CHARACTERS_POLICY = 'disabled' as const

/** Maps a `Campaign` document to the flat shape used by the settings form. */
export function mapCampaignToSettingsValues(campaign: Campaign): CampaignSettingsValues {
  const settings = campaign.configuration.settings?.characterCreation
  const flavor = campaign.configuration.flavor

  return {
    name: campaign.identity.name,
    description: campaign.identity.description ?? '',
    banner: [],
    startingLevel: settings?.startingLevel ?? DEFAULT_STARTING_LEVEL,
    importedCharactersPolicy:
      settings?.importedCharacters.policy ?? DEFAULT_IMPORTED_CHARACTERS_POLICY,
    playStyle: flavor?.playStyle,
    mood: flavor?.mood,
    magicLevel: flavor?.magicLevel,
    difficulty: flavor?.difficulty,
  }
}

/** Builds the API patch payload from validated form values. */
export function buildUpdateCampaignInput(
  values: CampaignSettingsValues,
  imageKey?: string,
): UpdateCampaignInput {
  return {
    name: values.name,
    description: values.description,
    ...(imageKey !== undefined && { imageKey }),
    settings: {
      characterCreation: {
        startingLevel: values.startingLevel,
        importedCharacters: { policy: values.importedCharactersPolicy },
      },
    },
    flavor: {
      playStyle: values.playStyle,
      mood: values.mood,
      magicLevel: values.magicLevel,
      difficulty: values.difficulty,
    },
  }
}
