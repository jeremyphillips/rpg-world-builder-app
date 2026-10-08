import type { ReactNode } from 'react'

import type { BadgeAppearance, BadgeTone } from '@rpg/ui'

/** Discrete state or callout — Member, Equipped, Spellcasting focus, Unavailable. */
export type EntitySummaryStatusBadge = {
  kind: 'badge'
  label: string
  tone?: BadgeTone
  appearance?: BadgeAppearance
  leadingIcon?: 'check' | 'warning'
  title?: string
  /** Rich tooltip body — when set, renders a hover/focus tooltip instead of native `title`. */
  tooltip?: ReactNode
}

/**
 * Supporting status annotation — capacity notices, warnings, selection guidance.
 * Ritual and concentration stay on the spell metadata line. Not a generic third-line slot.
 */
export type EntitySummaryStatusText = {
  kind: 'text'
  label: string
  /** `guidance` reads at foreground ink, above muted detail (requirements, recommendations). */
  variant?: 'muted' | 'warning' | 'guidance'
  /** Supplemental only — the label must stand on its own. */
  title?: string
}

/**
 * Status lane layout. `cluster` wraps items with a gap; `metadata` joins them on one
 * inline-metadata line with `·` separators (selection rows mixing badges and guidance).
 */
export type EntitySummaryStatusComposition = 'cluster' | 'metadata'

/** Circle-slash inactive row metadata — matches InlineInactiveStatus presentation. */
export type EntitySummaryStatusInactive = {
  kind: 'inactive'
  label: string
}

/** Validation error indicator for master-detail and similar surfaces. */
export type EntitySummaryStatusValidationError = {
  kind: 'validationError'
}

export type EntitySummaryStatusItem =
  | EntitySummaryStatusBadge
  | EntitySummaryStatusText
  | EntitySummaryStatusInactive
  | EntitySummaryStatusValidationError
