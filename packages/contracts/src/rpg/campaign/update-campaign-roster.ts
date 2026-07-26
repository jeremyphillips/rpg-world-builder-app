import { z } from 'zod'

import { characterRosterStatusSchema } from '../vocab/character-roster-status'
import {
  characterRosterStateSchema,
  type CharacterRosterState,
} from '../campaign/character-roster-state'

// ---------------------------------------------------------------------------
// Roster patch — client-writable status and note on participation.roster.
// changedAt is API-assigned via applyCampaignRosterTransitionMetadata.
// ---------------------------------------------------------------------------

export const campaignRosterPatchSchema = z.object({
  status: characterRosterStatusSchema.optional(),
  note: z.string().optional(),
  changedAt: z.string().datetime().optional(),
})

export type CampaignRosterPatch = z.infer<typeof campaignRosterPatchSchema>

function mergeRosterState(
  current: CharacterRosterState,
  patch: CampaignRosterPatch | undefined,
): CharacterRosterState {
  if (!patch) return current

  return {
    ...current,
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.note !== undefined ? { note: patch.note } : {}),
    ...(patch.changedAt !== undefined ? { changedAt: patch.changedAt } : {}),
  }
}

/** Pure merge — safe for previews and imports. Does not assign changedAt. */
export function mergeCampaignRosterPatch(
  current: CharacterRosterState,
  patch: CampaignRosterPatch,
): CharacterRosterState {
  return characterRosterStateSchema.parse(mergeRosterState(current, patch))
}

type ApplyCampaignRosterTransitionMetadataInput = {
  current: CharacterRosterState
  patch: CampaignRosterPatch
  timestamp: string
}

/** Mutation policy — assigns changedAt when roster status changes. */
export function applyCampaignRosterTransitionMetadata({
  current,
  patch,
  timestamp,
}: ApplyCampaignRosterTransitionMetadataInput): CharacterRosterState {
  const nextStatus = patch.status ?? current.status
  const statusChanged = patch.status !== undefined && patch.status !== current.status
  const nextChangedAt = statusChanged ? timestamp : current.changedAt

  return characterRosterStateSchema.parse({
    status: nextStatus,
    ...(patch.note !== undefined
      ? { note: patch.note }
      : current.note !== undefined
        ? { note: current.note }
        : {}),
    ...(nextChangedAt !== undefined ? { changedAt: nextChangedAt } : {}),
  })
}
