import type { ButtonVariantProps } from './button.variants'
import type { FieldHintPosition } from './field.variants'
import type { FieldRecommendation } from './field-recommendation.types'
import type { FormDensity } from '../../form/form-density'

/** Text-button scale for field recommendation actions — sm + compact at every form density. */
export function resolveFieldRecommendationButtonScale(_formDensity: FormDensity = 'comfortable'): {
  size: NonNullable<ButtonVariantProps['size']>
  density: NonNullable<ButtonVariantProps['density']>
} {
  return { size: 'sm', density: 'compact' }
}

/** Recommendation renders only with pre-control hints (`below-label`). */
export function resolveFieldLayoutRecommendation(
  hintPosition: FieldHintPosition | undefined,
  recommendation: FieldRecommendation | null | undefined,
): FieldRecommendation | null {
  if (!recommendation) return null
  if (hintPosition === 'below-control') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'FieldLayout: recommendation is omitted when hintPosition is "below-control" until that layout is designed.',
      )
    }
    return null
  }
  return recommendation
}
