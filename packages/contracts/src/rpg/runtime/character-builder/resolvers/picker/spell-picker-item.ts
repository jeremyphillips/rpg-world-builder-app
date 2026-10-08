import type { SpellPickerItem } from '../spellcasting/resolve-spell-picker-items'
import { compareRecommendedThenName } from './compare-recommended-then-name'

export function compareSpellPickerItemsByRecommendation(
  left: SpellPickerItem,
  right: SpellPickerItem,
): number {
  return compareRecommendedThenName(
    left.state.isRecommended,
    right.state.isRecommended,
    left.spell.name,
    right.spell.name,
  )
}
