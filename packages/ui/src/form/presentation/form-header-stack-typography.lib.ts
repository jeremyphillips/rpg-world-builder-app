import type { FieldSizeToken } from '../../components/ui/field-sizing.variants'
import {
  fieldGroupLegendHeaderStackVariants,
  fieldLabelHintStackClasses,
  fieldLabelTypographyVariants,
  type FieldGroupLegendSize,
  type FieldRhythm,
  type GroupHeadingScale,
} from '../../components/ui/field.variants'

export type FormHeaderPresentationScale = 'section' | 'subsection' | 'field'

export function resolveEffectiveFormHeaderScale(options: {
  namedGroupDepth: number
  headingScale?: GroupHeadingScale
}): FormHeaderPresentationScale {
  if (options.headingScale === 'field') return 'field'
  if (options.headingScale === 'section') return 'section'
  if (options.headingScale === 'subsection') return 'subsection'
  return options.namedGroupDepth === 0 ? 'section' : 'subsection'
}

/** FieldGroup / legend hosts without named-group depth — uses structural legend size. */
export function resolveEffectiveFormHeaderScaleFromLegendSize(options: {
  legendSize: FieldGroupLegendSize
  headingScale?: GroupHeadingScale
}): FormHeaderPresentationScale {
  if (options.headingScale === 'field') return 'field'
  if (options.headingScale === 'section') return 'section'
  if (options.headingScale === 'subsection') return 'subsection'
  return options.legendSize === 'section' ? 'section' : 'subsection'
}

function resolveStructuralLegendClass(
  scale: 'section' | 'subsection',
  rhythm: FieldRhythm,
): string {
  if (scale === 'section') {
    return rhythm === 'compact' ? 'text-style-field-legend-compact' : 'text-style-field-legend'
  }
  return rhythm === 'compact'
    ? 'text-style-field-legend-sub-compact'
    : 'text-style-field-legend-sub'
}

function resolveStructuralDescriptionClass(
  scale: 'section' | 'subsection',
  rhythm: FieldRhythm,
): string {
  if (scale === 'section') {
    return rhythm === 'compact'
      ? 'text-style-field-section-description-compact'
      : 'text-style-field-section-description'
  }
  return rhythm === 'compact'
    ? 'text-style-field-subsection-description-compact'
    : 'text-style-field-subsection-description'
}

export function resolveFormHeaderStackTypography(options: {
  headingScale: FormHeaderPresentationScale
  rhythm?: FieldRhythm
  size?: FieldSizeToken
}): {
  labelClass: string
  hintClass: string
  labelHintStackClass: string
} {
  const rhythm = options.rhythm ?? 'comfortable'
  const size = options.size ?? 'md'

  if (options.headingScale === 'field') {
    return {
      labelClass: fieldLabelTypographyVariants({ size }),
      hintClass: rhythm === 'compact' ? 'text-style-field-hint-compact' : 'text-style-field-hint',
      labelHintStackClass: fieldLabelHintStackClasses,
    }
  }

  return {
    labelClass: resolveStructuralLegendClass(options.headingScale, rhythm),
    hintClass: resolveStructuralDescriptionClass(options.headingScale, rhythm),
    labelHintStackClass: fieldGroupLegendHeaderStackVariants({ rhythm }),
  }
}
