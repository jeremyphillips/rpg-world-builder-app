import type { ProficiencyPickerItem } from '../proficiency/resolve-proficiency-picker-items'
import { compareRecommendedThenName } from './compare-recommended-then-name'

export function compareProficiencyPickerItemsByRecommendation(
  left: ProficiencyPickerItem,
  right: ProficiencyPickerItem,
): number {
  return compareRecommendedThenName(
    left.state.isRecommended,
    right.state.isRecommended,
    left.label,
    right.label,
  )
}
