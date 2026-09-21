import type { SpellPickerItem } from '../spellcasting/resolve-spell-picker-items'

export function compareSpellPickerItemsByRecommendation(
  left: SpellPickerItem,
  right: SpellPickerItem,
): number {
  if (left.state.isRecommended !== right.state.isRecommended) {
    return left.state.isRecommended ? -1 : 1
  }

  if (left.state.canSelect !== right.state.canSelect) {
    return left.state.canSelect ? -1 : 1
  }

  return left.spell.name.localeCompare(right.spell.name, undefined, { sensitivity: 'base' })
}
