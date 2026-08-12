import type { BadgeAppearance, BadgeTone } from '@rpg/ui'

/** Discrete state or callout — Member, Equipped, Spellcasting focus, Unavailable. */
export type EntitySummaryStatusBadge = {
  kind: 'badge'
  label: string
  tone?: BadgeTone
  appearance?: BadgeAppearance
  leadingIcon?: 'check' | 'warning'
  title?: string
}

/** Supporting status annotation — ritual/concentration markers, disabled notes. Not a generic third-line slot. */
export type EntitySummaryStatusText = {
  kind: 'text'
  label: string
  variant?: 'muted'
}

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
