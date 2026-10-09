import type { SpellPickerItem } from '../spellcasting/resolve-spell-picker-items'
import { compareRecommendationThenName } from './compare-recommendation-then-name'

export function compareSpellPickerItemsByRecommendation(
  left: SpellPickerItem,
  right: SpellPickerItem,
): number {
  return compareRecommendationThenName(
    left.state.recommendation,
    right.state.recommendation,
    left.spell.name,
    right.spell.name,
  )
}
