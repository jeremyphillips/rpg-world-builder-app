import { z } from 'zod'

import { characterRosterStatusSchema } from '../../vocab/character-roster-status'

const standaloneCharacterRouteContextSchema = z.object({
  kind: z.literal('standalone'),
})

const campaignCharacterRouteContextSchema = z.object({
  kind: z.literal('campaign'),
  openCampaign: z.object({ id: z.string().min(1) }),
  rosterStatus: characterRosterStatusSchema,
})

export const characterRouteContextSchema = z.discriminatedUnion('kind', [
  standaloneCharacterRouteContextSchema,
  campaignCharacterRouteContextSchema,
])

export type CharacterRouteContext = z.infer<typeof characterRouteContextSchema>
