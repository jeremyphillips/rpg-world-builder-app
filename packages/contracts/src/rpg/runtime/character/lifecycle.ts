import { z } from 'zod'

import {
  characterRosterStatusSchema,
  type CharacterRosterStatus,
} from '../../vocab/character-roster-status'
import {
  characterVitalStatusSchema,
  type CharacterVitalStatus,
} from '../../vocab/character-vital-status'

// ---------------------------------------------------------------------------
// Character lifecycle — shared roster and vital state for PCs and NPCs.
//
// This models current-state only. Event history, quest/session linkage, and
// narrative effective dates are deferred. Origin is documented inline only and
// is not persisted on the sheet.
//
// NPC lifecycle is instance state — not content draft/publish, source, or
// campaign availability semantics.
// ---------------------------------------------------------------------------

export const characterRosterStateSchema = z.object({
  status: characterRosterStatusSchema,
  note: z.string().optional(),
  changedAt: z.string().datetime().optional(),
})

export type CharacterRosterState = z.infer<typeof characterRosterStateSchema>

export const characterVitalStateSchema = z.object({
  status: characterVitalStatusSchema,
  note: z.string().optional(),
  changedAt: z.string().datetime().optional(),
})

export type CharacterVitalState = z.infer<typeof characterVitalStateSchema>

export const characterLifecycleSchema = z.object({
  roster: characterRosterStateSchema,
  vital: characterVitalStateSchema,
})

export type CharacterLifecycle = z.infer<typeof characterLifecycleSchema>

const DEFAULT_ROSTER_STATUS: CharacterRosterStatus = 'active'
const DEFAULT_VITAL_STATUS: CharacterVitalStatus = 'alive'

/** Default lifecycle for newly created PCs and NPCs — no notes or transition metadata. */
export function createDefaultCharacterLifecycle(): CharacterLifecycle {
  return {
    roster: { status: DEFAULT_ROSTER_STATUS },
    vital: { status: DEFAULT_VITAL_STATUS },
  }
}

function normalizeRosterState(input: unknown): CharacterRosterState {
  const parsed = characterRosterStateSchema.partial().safeParse(input)
  if (!parsed.success) {
    return { status: DEFAULT_ROSTER_STATUS }
  }

  return {
    status: parsed.data.status ?? DEFAULT_ROSTER_STATUS,
    ...(parsed.data.note !== undefined ? { note: parsed.data.note } : {}),
    ...(parsed.data.changedAt !== undefined ? { changedAt: parsed.data.changedAt } : {}),
  }
}

function normalizeVitalState(input: unknown): CharacterVitalState {
  const parsed = characterVitalStateSchema.partial().safeParse(input)
  if (!parsed.success) {
    return { status: DEFAULT_VITAL_STATUS }
  }

  return {
    status: parsed.data.status ?? DEFAULT_VITAL_STATUS,
    ...(parsed.data.note !== undefined ? { note: parsed.data.note } : {}),
    ...(parsed.data.changedAt !== undefined ? { changedAt: parsed.data.changedAt } : {}),
  }
}

/** Read-path normalization for legacy or partial lifecycle documents. */
export function normalizeCharacterLifecycle(input?: unknown): CharacterLifecycle {
  if (!input || typeof input !== 'object') {
    return createDefaultCharacterLifecycle()
  }

  const record = input as Record<string, unknown>

  return {
    roster: normalizeRosterState(record.roster),
    vital: normalizeVitalState(record.vital),
  }
}
