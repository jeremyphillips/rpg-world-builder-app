import type { SystemOverlayParticipantId } from './participants'
import type { OverlayCollectionMeta } from './annotate'

export type OverlayPathOverride = {
  participantId: SystemOverlayParticipantId
  path: string
  collection: OverlayCollectionMeta
  /** Why this path differs from the schema-owned default. */
  reason: string
}

/** Sparse path overrides. Prefer distinct annotated collection schemas over new entries. */
export const overlayPathOverrides: readonly OverlayPathOverride[] = []
