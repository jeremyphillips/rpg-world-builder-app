import {
  fieldControlBandVariants,
  fieldRowVariants,
  type FieldControlBand,
  type FieldRowAlignment,
  type FieldRowLayout,
} from './field-control-band.variants'
import { fieldLabelVariants, fieldSettingsRowClasses } from './field.variants'
import type { FieldSizeToken } from './field-sizing.variants'

/**
 * Label placement relative to the shared control band.
 *
 * - `hidden` — control only (aria-label / sr-only elsewhere)
 * - `stacked` — label above the band
 * - `inline` — label + control inside the band
 * - `settings` — settings grid; band wraps the right-side control only
 */
export type FieldLabelLayout = 'hidden' | 'stacked' | 'inline' | 'settings'

export type FieldPresentationConfig = {
  size: FieldSizeToken
  labelLayout: FieldLabelLayout
  controlBand?: FieldControlBand
}

export type FieldRowConfig = {
  layout?: FieldRowLayout
  /** Default `control-edge` (`items-end`). */
  align?: FieldRowAlignment
  /** Filters/toolbars use `toolbar` (`gap-2`); form rows use `form` (`gap-6`) or `compact` (`gap-4`). */
  gap?: 'toolbar' | 'form' | 'compact'
}

export type FieldRowPresentation = {
  groupClassName: string
  controlBandClassName: string
  labelClassName: string
  controlSize: FieldSizeToken
  alignmentAnchorClassName: string
}

function resolveGroupClassName(labelLayout: FieldLabelLayout): string {
  switch (labelLayout) {
    case 'stacked':
      return 'flex flex-col gap-1'
    case 'inline':
      return 'flex flex-wrap items-center gap-2'
    case 'settings':
      return fieldSettingsRowClasses
    case 'hidden':
    default:
      return ''
  }
}

function resolveAlignmentAnchorClassName(labelLayout: FieldLabelLayout): string {
  switch (labelLayout) {
    case 'stacked':
      // `gap-y-2` (not `gap-2` / `space-y-2`) keeps this distinct from form rhythm
      // stacks and Field.Root anatomy, which tests often query by those class tuples.
      return 'flex flex-col gap-y-2'
    case 'settings':
      return ''
    case 'inline':
    case 'hidden':
    default:
      return ''
  }
}

/**
 * Resolves shared field presentation classes for a single field.
 *
 * Core invariant: fields in a row align by a shared control band. Labels render
 * above or within that band; helper/validation content renders below the
 * alignment anchor (`data-field-align`).
 */
export function resolveFieldPresentation(config: FieldPresentationConfig): FieldRowPresentation {
  const { size, labelLayout } = config
  const controlBand = config.controlBand ?? 'single-line'

  return {
    groupClassName: resolveGroupClassName(labelLayout),
    controlBandClassName: fieldControlBandVariants({ size, band: controlBand }),
    labelClassName: fieldLabelVariants({ size }),
    controlSize: size,
    alignmentAnchorClassName: resolveAlignmentAnchorClassName(labelLayout),
  }
}

/** Resolves flex/grid row classes for `FieldRow`, filter bars, and action clusters. */
export function resolveFieldRowClasses(config: FieldRowConfig = {}): string {
  return fieldRowVariants({
    layout: config.layout ?? 'flow',
    align: config.align ?? 'control-edge',
    gap: config.gap ?? 'form',
  })
}

/** Convenience: single-line control band for trailing actions at a given size. */
export function resolveFieldActionBandClassName(size: FieldSizeToken = 'sm'): string {
  return fieldControlBandVariants({ size, band: 'single-line' })
}

/** Maps form `labelPosition` to shared {@link FieldLabelLayout}. */
export function mapFormLabelPositionToLayout(
  labelPosition: 'above' | 'settings' | 'inline' | undefined,
): FieldLabelLayout {
  if (labelPosition === 'settings') return 'settings'
  if (labelPosition === 'inline') return 'inline'
  return 'stacked'
}
