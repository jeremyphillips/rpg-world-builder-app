import type { ContentDisplayFallback, ContentDisplayImage } from '@rpg/contracts'
import type { CatalogPickerRowActionIntent } from '@rpg/ui'

import type { EntitySummaryStatusItem } from './entity-summary-status.types'

/** Plain identity slots for compact entity surfaces — no JSX, no media nodes. */
export type EntitySurfaceIdentity = {
  heading: string
  metadata?: string
  classification?: string
  status?: readonly EntitySummaryStatusItem[]
  displayImage?: ContentDisplayImage
  fallback: ContentDisplayFallback
}

export type EntitySurfaceInlineAction = {
  label: string
  onClick: () => void
  /** Defaults to add (plus). Remove renders minus. */
  intent?: CatalogPickerRowActionIntent
  disabled?: boolean
  loading?: boolean
}
