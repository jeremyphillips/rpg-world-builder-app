import type { ButtonVariantProps } from './button.variants'
import type { FieldHintPosition } from './field.variants'
import type {
  FieldLayoutRecommendation,
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

/** Field recommendations render above the control regardless of hint placement. */
export function resolveFieldLayoutRecommendation(
  _hintPosition: FieldHintPosition | undefined,
  recommendation: FieldLayoutRecommendation | null | undefined,
): FieldLayoutRecommendation | null {
  return recommendation ?? null
}
