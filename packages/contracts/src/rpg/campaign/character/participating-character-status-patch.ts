import { z } from 'zod'

import { characterVitalPatchSchema } from '../../runtime/character/update-character-vital'
import { campaignRosterPatchSchema } from './update-roster'

/** Vital and roster patches for campaign PCs and NPCs with open participation. */
export const campaignParticipatingCharacterStatusPatchSchema = z.object({
  vital: characterVitalPatchSchema.optional(),
  roster: campaignRosterPatchSchema.optional(),
})

export type CampaignParticipatingCharacterStatusPatch = z.infer<
  typeof campaignParticipatingCharacterStatusPatchSchema
>

/** @deprecated Use `campaignParticipatingCharacterStatusPatchSchema`. */
export const campaignNpcStatusPatchSchema = campaignParticipatingCharacterStatusPatchSchema

/** @deprecated Use `CampaignParticipatingCharacterStatusPatch`. */
export type CampaignNpcStatusPatch = CampaignParticipatingCharacterStatusPatch
