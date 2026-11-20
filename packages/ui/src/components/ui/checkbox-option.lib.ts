import type { FieldSize } from './field.client'
import type { ChoiceTone } from './choice-control.styles'
import { resolveFilterControlSize } from '../../filters/filter-presentation.lib'
import type { FilterDensity } from '../../filters/filter-schema.types'

export type CheckboxOptionScale = 'sm' | 'md'

export type ResolveCheckboxOptionScaleOptions = {
  explicitSize?: CheckboxOptionScale
  filterDensity?: FilterDensity
  formSize: FieldSize
}

export type ResolvedCheckboxOptionScale = {
  /** Set only for an explicit `size` prop so card density CSS can tell it apart. */
  explicit: CheckboxOptionScale | undefined
  scale: CheckboxOptionScale
}

/** Maps field control scale to compact (13px) vs comfortable (15px) option copy. */
export function fieldSizeToOptionTypographyScale(size: FieldSize): CheckboxOptionScale {
  return size === 'xs' || size === 'sm' ? 'sm' : 'md'
}

/**
 * Base scale for outlined checkbox options. Heading and card density override this in CSS:
 * heading inline wins, then explicit size, then `data-content-density`, then this result.
 */
export function resolveCheckboxOptionScale(
  options: ResolveCheckboxOptionScaleOptions,
): ResolvedCheckboxOptionScale {
  if (options.explicitSize) {
    return { explicit: options.explicitSize, scale: options.explicitSize }
  }
  if (options.filterDensity) {
    return { explicit: undefined, scale: resolveFilterControlSize(options.filterDensity) }
  }
  return { explicit: undefined, scale: fieldSizeToOptionTypographyScale(options.formSize) }
}

export type { ChoiceTone }
