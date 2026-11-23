import type { ReactNode } from 'react'
import type { FacingResolution } from '@rpg/contracts'

export type StructuredFacingHostId =
  | 'class-features'
  | 'subclass-features'
  | 'monster-action-sections'
  | 'monster-traits'
  | 'species-traits'
  | 'heritage-options'

/** Host-owned subscription resolves live facing for the selected structured row. */
export type FacingHostConfig = {
  hostId: StructuredFacingHostId
  resolveSelectedFacing: () => FacingResolution | undefined
  /** Optional preview chrome beside the panel (attack metadata, shape-shift destinations, …). */
  chromeTrailing?: ReactNode
  context?: string
}
