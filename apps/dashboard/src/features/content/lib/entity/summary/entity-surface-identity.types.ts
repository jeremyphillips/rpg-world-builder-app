import type { ContentDisplayFallback, ContentDisplayImage } from '@rpg/contracts'
import type { CatalogPickerRowActionIntent, CatalogPickerRowActionTooltip } from '@rpg/ui'

import type { PickerSelectionStateLineModel } from './picker-selection-state-line.types'
import type { EntitySummaryStatusItem } from './entity-summary-status.types'

/** Plain identity slots for compact entity surfaces — no JSX, no media nodes. */
export type EntitySurfaceIdentity = {
  heading: string
  metadata?: string
  classification?: string
  status?: readonly EntitySummaryStatusItem[]
  /** Resolved selection-state copy. Connection sheets set this without JSX. */
  selectionState?: PickerSelectionStateLineModel
  displayImage?: ContentDisplayImage
  fallback: ContentDisplayFallback
}

export type EntitySurfaceInlineAction = {
  label: string
  /** Shown while `loading` is set. Callers pass the family pending label. */
  pendingLabel?: string
  onClick: () => void
  /** Defaults to add (plus). Remove renders minus. */
  intent?: CatalogPickerRowActionIntent
  disabled?: boolean
  loading?: boolean
  failed?: boolean
  /** Clears a stale failure when the row's entity changes. */
  entityKey?: string
  tooltip?: CatalogPickerRowActionTooltip
}
