import { z } from 'zod'

import { characterRosterStateSchema } from '../../campaign/character/roster-state'
import { campaignCharacterCardSchema } from '../character/summary/character-card-dtos'

// ---------------------------------------------------------------------------
// Campaign character list item — composed card + optional controller + roster.
// ---------------------------------------------------------------------------

export const campaignCharacterControllerSchema = z.object({
  membershipId: z.string().min(1),
  displayName: z.string().min(1),
})

export type CampaignCharacterController = z.infer<typeof campaignCharacterControllerSchema>

export const campaignCharacterListItemSchema = z.object({
  character: campaignCharacterCardSchema,
  controller: campaignCharacterControllerSchema.nullable(),
  roster: characterRosterStateSchema,
})

export type CampaignCharacterListItem = z.infer<typeof campaignCharacterListItemSchema>

export const campaignCharacterListResponseSchema = z.object({
  characters: z.array(campaignCharacterListItemSchema),
})

export type CampaignCharacterListResponse = z.infer<typeof campaignCharacterListResponseSchema>
