import type { ProficiencyPickerItem } from '../proficiency/resolve-proficiency-picker-items'

export function compareProficiencyPickerItemsByRecommendation(
  left: ProficiencyPickerItem,
  right: ProficiencyPickerItem,
): number {
  if (left.state.isRecommended !== right.state.isRecommended) {
    return left.state.isRecommended ? -1 : 1
  }

  if (left.state.canSelect !== right.state.canSelect) {
    return left.state.canSelect ? -1 : 1
  }

  return left.label.localeCompare(right.label, undefined, { sensitivity: 'base' })
}
