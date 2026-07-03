import { buildGroupedSpellcastingAbilityOptions } from '@rpg/contracts'
import type { SelectFieldOptionListItem } from '@rpg/ui/form'

/** Grouped spellcasting ability options (`Common` / `Advanced`) for select fields. */
export function getSpellcastingAbilityFieldOptions(): SelectFieldOptionListItem[] {
  return buildGroupedSpellcastingAbilityOptions().map((group) => ({
    kind: 'group' as const,
    label: group.label,
    options: group.options,
  }))
}
