import { z } from 'zod'

/** One pickable PC for campaign-access `specific_players` grants. */
export const campaignAccessParticipantEntrySchema = z.object({
  /** PC character document id — stored in `participantIds`. */
  id: z.string().min(1),
  name: z.string().min(1),
  playerDisplayName: z.string().min(1),
})

export type CampaignAccessParticipantEntry = z.infer<typeof campaignAccessParticipantEntrySchema>

export const campaignAccessParticipantRosterSchema = z.object({
  participants: z.array(campaignAccessParticipantEntrySchema),
})

export type CampaignAccessParticipantRoster = z.infer<typeof campaignAccessParticipantRosterSchema>
