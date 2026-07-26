import { z } from 'zod'

import {
  characterVitalStatusSchema,
  type CharacterVitalStatus,
} from '../../vocab/character-vital-status'

// ---------------------------------------------------------------------------
// Character vital — intrinsic life/death state on the character record.
// Campaign-relative roster state lives on CampaignCharacterParticipation.
// ---------------------------------------------------------------------------

export const characterVitalStateSchema = z.object({
  status: characterVitalStatusSchema,
  note: z.string().optional(),
  changedAt: z.string().datetime().optional(),
})

export type CharacterVitalState = z.infer<typeof characterVitalStateSchema>

const DEFAULT_VITAL_STATUS: CharacterVitalStatus = 'alive'

/** Default vital for newly created characters — no notes or transition metadata. */
export function createDefaultCharacterVitalState(): CharacterVitalState {
  return { status: DEFAULT_VITAL_STATUS }
}

/** Read-path normalization for legacy or partial vital documents. */
export function normalizeCharacterVital(input?: unknown): CharacterVitalState {
  if (!input || typeof input !== 'object') {
    return createDefaultCharacterVitalState()
  }

  const parsed = characterVitalStateSchema.partial().safeParse(input)
  if (!parsed.success) {
    return createDefaultCharacterVitalState()
  }

  return {
    status: parsed.data.status ?? DEFAULT_VITAL_STATUS,
    ...(parsed.data.note !== undefined ? { note: parsed.data.note } : {}),
    ...(parsed.data.changedAt !== undefined ? { changedAt: parsed.data.changedAt } : {}),
  }
}
