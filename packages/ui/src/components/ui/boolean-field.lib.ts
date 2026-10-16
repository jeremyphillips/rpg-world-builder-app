import type { FieldSize } from './field.client'
import type { ChoiceTone } from './choice-control.styles'
import { resolveFilterControlSize } from '../../filters/filter-presentation.lib'
import type { FilterDensity } from '../../filters/filter-schema.types'

export type BooleanFieldScale = 'sm' | 'md'

export type ResolveBooleanFieldScaleOptions = {
  explicitSize?: BooleanFieldScale
  filterDensity?: FilterDensity
  formSize: FieldSize
}

export type ResolvedBooleanFieldScale = {
  /** Set only for an explicit `size` prop so card density CSS can tell it apart. */
  explicit: BooleanFieldScale | undefined
  scale: BooleanFieldScale
}

function formSizeToScale(size: FieldSize): BooleanFieldScale {
  return size === 'xs' || size === 'sm' ? 'sm' : 'md'
}

/**
 * Base scale for BooleanField. Heading and card density override this in CSS:
 * heading inline wins, then explicit size, then `data-content-density`, then this result.
 */
export function resolveBooleanFieldScale(
  options: ResolveBooleanFieldScaleOptions,
): ResolvedBooleanFieldScale {
  if (options.explicitSize) {
    return { explicit: options.explicitSize, scale: options.explicitSize }
  }
  if (options.filterDensity) {
    return { explicit: undefined, scale: resolveFilterControlSize(options.filterDensity) }
  }
  return { explicit: undefined, scale: formSizeToScale(options.formSize) }
}

export type { ChoiceTone }
