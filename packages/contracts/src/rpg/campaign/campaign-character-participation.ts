import { z } from 'zod'

import { type CharacterRosterStatus } from '../vocab/character-roster-status'
import { characterRosterStateSchema, type CharacterRosterState } from './character-roster-state'

// ---------------------------------------------------------------------------
// Campaign character participation — canonical character↔campaign association.
//
// Participation answers: which campaign is this character participating in?
// It does NOT establish player control (see CampaignMembership.controlledCharacterIds).
//
// Roster (active/inactive/retired) is campaign-relative and lives here.
// Vital (alive/deceased/unknown) lives on Character.vital.
// ---------------------------------------------------------------------------

export { characterRosterStateSchema, type CharacterRosterState }

const DEFAULT_ROSTER_STATUS: CharacterRosterStatus = 'active'

/** Default roster for new participations — no notes or transition metadata. */
export function createDefaultCampaignRosterState(): CharacterRosterState {
  return { status: DEFAULT_ROSTER_STATUS }
}

export const campaignCharacterParticipationSchema = z.object({
  id: z.string().min(1),
  campaignId: z.string().min(1),
  characterId: z.string().min(1),
  roster: characterRosterStateSchema,
  joinedAt: z.iso.datetime(),
  /** Schema-only in MVP — no production writer until leave/transfer workflows land. */
  leftAt: z.iso.datetime().optional(),
})

export type CampaignCharacterParticipation = z.infer<typeof campaignCharacterParticipationSchema>

export const createCampaignCharacterParticipationInputSchema = z.object({
  campaignId: z.string().min(1),
  characterId: z.string().min(1),
  joinedAt: z.iso.datetime(),
  roster: characterRosterStateSchema,
})

export type CreateCampaignCharacterParticipationInput = z.infer<
  typeof createCampaignCharacterParticipationInputSchema
>
