import type { FacingDocument } from '@rpg/contracts'

import type { RulesPreviewMetadataRow } from './rules-preview'

/** Dashboard-built display model for Rules Preview — no reason codes or feature React nodes. */
export type FacingHostPanelModel = {
  status: 'ready' | 'incomplete' | 'invalid' | 'unavailable' | 'failed'
  document?: FacingDocument
  message?: string
  context?: string
  metadataRows?: readonly RulesPreviewMetadataRow[]
}
