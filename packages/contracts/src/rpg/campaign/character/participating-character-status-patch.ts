import { z } from 'zod'

import { campaignCharacterVitalPatchSchema } from './campaign-character-vital-patch'
import { campaignRosterPatchSchema } from './update-roster'

/** Vital and roster patches for campaign PCs and NPCs with open participation. */
export const campaignParticipatingCharacterStatusPatchSchema = z.object({
  vital: campaignCharacterVitalPatchSchema.optional(),
  roster: campaignRosterPatchSchema.optional(),
})

export type CampaignParticipatingCharacterStatusPatch = z.infer<
  typeof campaignParticipatingCharacterStatusPatchSchema
>

/** @deprecated Use `campaignParticipatingCharacterStatusPatchSchema`. */
export const campaignNpcStatusPatchSchema = campaignParticipatingCharacterStatusPatchSchema

/** @deprecated Use `CampaignParticipatingCharacterStatusPatch`. */
export type CampaignNpcStatusPatch = CampaignParticipatingCharacterStatusPatch
