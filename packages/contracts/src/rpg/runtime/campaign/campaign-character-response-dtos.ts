import { z } from 'zod'

import { campaignCharacterCapabilitiesSchema } from '../../campaign/character/access-dtos'
import { characterRosterStateSchema } from '../../campaign/character/roster-state'
import { pcCharacterSchema } from '../character/sheet'

export const campaignCharacterGetResponseSchema = z.object({
  character: pcCharacterSchema,
  capabilities: campaignCharacterCapabilitiesSchema,
  participation: z.object({
    roster: characterRosterStateSchema,
  }),
})

export type CampaignCharacterGetResponse = z.infer<typeof campaignCharacterGetResponseSchema>

export const characterRoutingContextResponseSchema = z.object({
  openCampaign: z.object({ id: z.string().min(1) }).optional(),
})

export type CharacterRoutingContextResponse = z.infer<typeof characterRoutingContextResponseSchema>
