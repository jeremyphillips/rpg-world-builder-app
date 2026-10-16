import type { ButtonVariantProps } from './button.variants'
import type { FieldHintPosition } from './field.variants'
import type {
  FieldRecommendation,
  FieldRecommendationAction,
  FieldRecommendationGroup,
  FieldRecommendationItem,
} from './field-recommendation.types'
import type { FormDensity } from '../../form/form-density'

/** Minimum actionable recommendations before bulk add is shown. */
export const FIELD_RECOMMENDATION_GROUP_BULK_MIN_COUNT = 3

export const FIELD_RECOMMENDATION_GROUP_BULK_ADD_LABEL = 'Add all'

export function resolveActionableFieldRecommendationItems(
  items: readonly FieldRecommendationItem[],
): readonly FieldRecommendationItem[] {
  return items.filter((item) => !item.disabled)
}

/** Returns bulk action when configured and actionable count meets the shared threshold. */
export function resolveFieldRecommendationGroupBulkAction(
  group: FieldRecommendationGroup,
): FieldRecommendationAction | null {
  if (!group.bulkAction) return null
  const actionableCount = resolveActionableFieldRecommendationItems(group.items).length
  if (actionableCount < FIELD_RECOMMENDATION_GROUP_BULK_MIN_COUNT) return null
  return group.bulkAction
}

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
