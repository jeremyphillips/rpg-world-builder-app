import type { ProficiencyPickerItem } from '../proficiency/resolve-proficiency-picker-items'
import { compareRecommendationThenName } from './compare-recommendation-then-name'

export function compareProficiencyPickerItemsByRecommendation(
  left: ProficiencyPickerItem,
  right: ProficiencyPickerItem,
): number {
  return compareRecommendationThenName(
    left.state.recommendation,
    right.state.recommendation,
    left.label,
    right.label,
  )
}
