import { z } from 'zod'

import { characterClassEntrySchema, characterSpeciesSchema } from '../runtime/character/core'
import { characterVitalStateSchema } from '../runtime/character/character-vital'
import { campaignCharacterParticipationSchema } from './campaign-character-participation'
import { characterRosterStateSchema } from './character-roster-state'
import { campaignRosterPatchSchema } from './update-campaign-roster'
import { characterVitalPatchSchema } from '../runtime/character/update-character-vital'
import { npcCharacterSchema } from '../runtime/character/sheet'

// ---------------------------------------------------------------------------
// Campaign NPC DTOs — locked list, detail, and patch shapes.
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

export const campaignNpcStatusPatchSchema = z.object({
  vital: characterVitalPatchSchema.optional(),
  roster: campaignRosterPatchSchema.optional(),
})

export type CampaignNpcStatusPatch = z.infer<typeof campaignNpcStatusPatchSchema>
