import type { z } from 'zod'
import type { CreateCampaignInput } from '@rpg/contracts'

import { flavorSchema, identitySchema } from './profile/campaign-profile-form-fields'
import {
  buildUpdateCampaignInput,
  mapCampaignToSettingsValues,
} from './profile/campaign-profile-form-values'
import { createRulesSchema } from './rules/character-configuration/character-configuration-form'
import type {
  CreateRulesValues,
  RulesValues,
} from './rules/character-configuration/character-configuration-form-fields'
import { buildCharacterCreationPatchInputFromCreateWizard } from './rules/character-configuration/character-configuration-form-values'

export type { CreateRulesValues, RulesValues }
export {
  buildCharacterCreationPatchInput,
  mapRulesetPatchToRulesValues,
} from './rules/character-configuration/character-configuration-form-values'
export { buildUpdateCampaignInput, mapCampaignToSettingsValues }

export const campaignSettingsSchema = identitySchema.and(flavorSchema)

export type CampaignSettingsValues = z.infer<typeof campaignSettingsSchema>

export const campaignCreateSchema = identitySchema.and(createRulesSchema).and(flavorSchema)

export type CampaignCreateValues = z.infer<typeof campaignCreateSchema>

/** Builds the create payload from the flat values accumulated by the wizard. */
export function buildCreateCampaignInput(
  values: CampaignCreateValues,
  imageKey?: string,
): CreateCampaignInput {
  return {
    name: values.name,
    description: values.description,
    ...(imageKey !== undefined && { imageKey }),
    characterCreation: buildCharacterCreationPatchInputFromCreateWizard(values),
    flavor: {
      playStyle: values.playStyle,
      mood: values.mood,
      magicLevel: values.magicLevel,
      difficulty: values.difficulty,
    },
  }
}
