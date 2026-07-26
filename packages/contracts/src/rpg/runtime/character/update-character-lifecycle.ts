import { z } from 'zod'

import {
  characterRosterStatusSchema,
  type CharacterRosterStatus,
} from '../../vocab/character-roster-status'
import {
  characterVitalStatusSchema,
  type CharacterVitalStatus,
} from '../../vocab/character-vital-status'
import {
  characterLifecycleSchema,
  type CharacterLifecycle,
  type CharacterRosterState,
  type CharacterVitalState,
} from './lifecycle'

// ---------------------------------------------------------------------------
// Lifecycle patch — client-writable status and note per dimension.
// changedAt is API-assigned via applyLifecycleTransitionMetadata.
// ---------------------------------------------------------------------------

export const characterRosterStatePatchSchema = z.object({
  status: characterRosterStatusSchema.optional(),
  note: z.string().optional(),
  changedAt: z.string().datetime().optional(),
})

export type CharacterRosterStatePatch = z.infer<typeof characterRosterStatePatchSchema>

export const characterVitalStatePatchSchema = z.object({
  status: characterVitalStatusSchema.optional(),
  note: z.string().optional(),
  changedAt: z.string().datetime().optional(),
})

export type CharacterVitalStatePatch = z.infer<typeof characterVitalStatePatchSchema>

export const characterLifecyclePatchSchema = z.object({
  roster: characterRosterStatePatchSchema.optional(),
  vital: characterVitalStatePatchSchema.optional(),
})

export type CharacterLifecyclePatch = z.infer<typeof characterLifecyclePatchSchema>

function mergeDimensionState<T extends CharacterRosterState | CharacterVitalState>(
  current: T,
  patch: Partial<T> | undefined,
): T {
  if (!patch) return current

  return {
    ...current,
    ...(patch.status !== undefined ? { status: patch.status } : {}),
    ...(patch.note !== undefined ? { note: patch.note } : {}),
    ...(patch.changedAt !== undefined ? { changedAt: patch.changedAt } : {}),
  } as T
}

/** Pure merge — safe for previews, imports, and migrations. Does not assign changedAt. */
export function mergeCharacterLifecyclePatch(
  current: CharacterLifecycle,
  patch: CharacterLifecyclePatch,
): CharacterLifecycle {
  return characterLifecycleSchema.parse({
    roster: mergeDimensionState(current.roster, patch.roster),
    vital: mergeDimensionState(current.vital, patch.vital),
  })
}

type ApplyLifecycleTransitionMetadataInput = {
  current: CharacterLifecycle
  patch: CharacterLifecyclePatch
  timestamp: string
}

function applyDimensionTransitionMetadata<
  TStatus extends CharacterRosterStatus | CharacterVitalStatus,
  TState extends { status: TStatus; note?: string; changedAt?: string },
  TPatch extends { status?: TStatus; note?: string },
>(current: TState, patch: TPatch | undefined, timestamp: string): TState {
  if (!patch) return current

  const nextStatus = patch.status ?? current.status
  const statusChanged = patch.status !== undefined && patch.status !== current.status
  const nextChangedAt = statusChanged ? timestamp : current.changedAt

  const next = {
    status: nextStatus,
    ...(patch.note !== undefined
      ? { note: patch.note }
      : current.note !== undefined
        ? { note: current.note }
        : {}),
    ...(nextChangedAt !== undefined ? { changedAt: nextChangedAt } : {}),
  }

  return next as TState
}

/** Mutation policy — assigns changedAt when a dimension status changes. */
export function applyLifecycleTransitionMetadata({
  current,
  patch,
  timestamp,
}: ApplyLifecycleTransitionMetadataInput): CharacterLifecycle {
  return characterLifecycleSchema.parse({
    roster: applyDimensionTransitionMetadata(current.roster, patch.roster, timestamp),
    vital: applyDimensionTransitionMetadata(current.vital, patch.vital, timestamp),
  })
}
