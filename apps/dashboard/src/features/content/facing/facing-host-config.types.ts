import type { FacingHostPanelModel } from '@rpg/ui'

export type StructuredFacingHostId =
  | 'class-features'
  | 'monster-action-sections'
  | 'monster-traits'
  | 'species-traits'
  | 'heritage-options'

/** Host-owned subscription resolves the preview panel display model for the selected row. */
export type FacingHostConfig = {
  hostId: StructuredFacingHostId
  resolvePanelModel: () => FacingHostPanelModel | undefined
}
