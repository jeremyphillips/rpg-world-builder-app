import { z } from 'zod'

import { characterVitalStatusSchema } from '../../vocab/character-vital-status'
import { characterVitalStateSchema, type CharacterVitalState } from './sheet/character-vital'

// ---------------------------------------------------------------------------
// Vital patch — client-writable status and note.
// changedAt is API-assigned via applyCharacterVitalTransitionMetadata.
// ---------------------------------------------------------------------------

export const characterVitalPatchSchema = z.object({
  status: characterVitalStatusSchema.optional(),
  note: z.string().optional(),
  changedAt: z.string().datetime().optional(),
})

export type CharacterVitalPatch = z.infer<typeof characterVitalPatchSchema>

function mergeVitalState(
  current: CharacterVitalState,
  patch: CharacterVitalPatch | undefined,
): CharacterVitalState {
  if (!patch) return current

  return {
    ...current,
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.note !== undefined ? { note: patch.note } : {}),
    ...(patch.changedAt !== undefined ? { changedAt: patch.changedAt } : {}),
  }
}

/** Pure merge — safe for previews and imports. Does not assign changedAt. */
export function mergeCharacterVitalPatch(
  current: CharacterVitalState,
  patch: CharacterVitalPatch,
): CharacterVitalState {
  return characterVitalStateSchema.parse(mergeVitalState(current, patch))
}

type ApplyCharacterVitalTransitionMetadataInput = {
  current: CharacterVitalState
  patch: CharacterVitalPatch
  timestamp: string
}

/** Mutation policy — assigns changedAt when vital status changes. */
export function applyCharacterVitalTransitionMetadata({
  current,
  patch,
  timestamp,
}: ApplyCharacterVitalTransitionMetadataInput): CharacterVitalState {
  const nextStatus = patch.status ?? current.status
  const statusChanged = patch.status !== undefined && patch.status !== current.status
  const nextChangedAt = statusChanged ? timestamp : current.changedAt

  return characterVitalStateSchema.parse({
    status: nextStatus,
    ...(patch.note !== undefined
      ? { note: patch.note }
      : current.note !== undefined
        ? { note: current.note }
        : {}),
    ...(nextChangedAt !== undefined ? { changedAt: nextChangedAt } : {}),
  })
}
