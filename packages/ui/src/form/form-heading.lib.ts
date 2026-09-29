import type { ReactNode } from 'react'

import type { FieldGroupLegendSize } from '../components/ui/field.variants'
import type { FieldHintConfig } from './field-config'

/** Resolved typography tier — label and hint always share this tier. */
export type FormHeadingTier = 'section' | 'subsection' | 'leaf'

/**
 * Feature-level heading — tier is never authored on dashboard form JSON.
 *
 * `accessory` is a **group-heading** slot only (wired through `GroupFieldSection` →
 * `FieldGroup`). Status/decorative content (badges, static text) — not buttons, links,
 * or other focusable controls inside `<legend>`.
 *
 * `action` is a **group-heading** trailing slot (same end alignment as array legend add
 * controls). Use compact `sm` text/outline buttons — not nested inside `<legend>` text.
 */
export type FormHeading = {
  label: string
  hint?: string | FieldHintConfig
  accessory?: ReactNode
  action?: ReactNode
}

/** Label + hint slice shared by arrays and other section headings. */
export type FormHeadingContent = Pick<FormHeading, 'label' | 'hint'>

export type FieldLabelVisibility = 'visible' | 'srOnly'

type LabelVisibilitySource = {
  labelVisibility?: FieldLabelVisibility
}

/** Single resolver for visible vs screen-reader-only leaf labels. */
export function resolveFieldLabelVisibility(source: LabelVisibilitySource): FieldLabelVisibility {
  return source.labelVisibility ?? 'visible'
}

/** Maps named-group depth to structural section typography (capped at subsection). */
export function resolveGroupHeadingTier(namedGroupDepth: number): 'section' | 'subsection' {
  return namedGroupDepth === 0 ? 'section' : 'subsection'
}

/** Increments depth only when entering a named structural group or array. */
export function resolveNamedGroupDepthAfterEntering(
  hasNamedHeading: boolean,
  parentNamedGroupDepth: number,
): number {
  return hasNamedHeading ? parentNamedGroupDepth + 1 : parentNamedGroupDepth
}

/** Bridges structural tier to existing group legend size tokens. */
export function resolveGroupLegendSize(tier: 'section' | 'subsection'): FieldGroupLegendSize {
  return tier
}

export function isNonWhitespaceLabel(label: string | undefined): label is string {
  return Boolean(label?.trim())
}
