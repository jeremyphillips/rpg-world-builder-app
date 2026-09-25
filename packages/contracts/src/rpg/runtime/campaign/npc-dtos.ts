import { z } from 'zod'

import { characterClassEntrySchema, characterSpeciesSchema } from '../character/sheet/core'
import { characterVitalStateSchema } from '../character/sheet/character-vital'
import { npcCharacterSchema } from '../character/sheet'
import { campaignCharacterParticipationSchema } from '../../campaign/character/participation'
import { characterRosterStateSchema } from '../../campaign/character/roster-state'
import {
  campaignNpcStatusPatchSchema,
  type CampaignNpcStatusPatch,
} from '../../campaign/character/participating-character-status-patch'

// ---------------------------------------------------------------------------
// Campaign NPC DTOs — composed list, detail, and patch wire shapes.
// ---------------------------------------------------------------------------

export const npcListCharacterSummarySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  vital: characterVitalStateSchema,
  classes: z.array(characterClassEntrySchema).min(1),
  species: characterSpeciesSchema,
})

export type NpcListCharacterSummary = z.infer<typeof npcListCharacterSummarySchema>

export const campaignNpcListItemSchema = z.object({
  character: npcListCharacterSummarySchema,
  participation: z.object({
    id: z.string().min(1),
    roster: characterRosterStateSchema,
    joinedAt: z.iso.datetime(),
  }),
})

export type CampaignNpcListItem = z.infer<typeof campaignNpcListItemSchema>

export const campaignNpcDetailSchema = z.object({
  character: npcCharacterSchema,
  participation: campaignCharacterParticipationSchema,
})

export type CampaignNpcDetail = z.infer<typeof campaignNpcDetailSchema>

export { campaignNpcStatusPatchSchema, type CampaignNpcStatusPatch }
