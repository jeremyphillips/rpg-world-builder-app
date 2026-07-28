import type { z } from 'zod'
import type { CreateCampaignInput } from '@rpg/contracts'

import { flavorSchema, identitySchema } from './profile/campaign-profile-form-fields'
import { inviteMembersSchema } from './invite-members-form-fields'
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

export const campaignCreateSchema = identitySchema
  .and(createRulesSchema)
  .and(flavorSchema)
  .and(inviteMembersSchema)

export type CampaignCreateValues = z.infer<typeof campaignCreateSchema>

/** Builds the create payload from the flat values accumulated by the wizard. */
export function buildCreateCampaignInput(
  values: CampaignCreateValues,
  imageKey?: string,
  campaignTemplateId?: string,
): CreateCampaignInput {
  const inviteEmails = (values.inviteEmails ?? [])
    .map((entry) => ({ email: entry.email.trim() }))
    .filter((entry) => entry.email.length > 0)

  return {
    name: values.name,
    description: values.description,
    ...(imageKey !== undefined && { imageKey }),
    ...(campaignTemplateId !== undefined && { campaignTemplateId }),
    characterCreation: buildCharacterCreationPatchInputFromCreateWizard(values),
    flavor: {
      playStyle: values.playStyle,
      mood: values.mood,
      magicLevel: values.magicLevel,
      difficulty: values.difficulty,
    },
    ...(inviteEmails.length > 0 ? { inviteEmails } : {}),
  }
}
