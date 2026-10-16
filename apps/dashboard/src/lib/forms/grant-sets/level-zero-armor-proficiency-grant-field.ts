import { proficiencyDomainFieldNoun } from '@rpg/contracts'

import {
  modeDependentGrantSetField,
  type ModeDependentGrantSetFieldOptions,
} from '@/lib/forms/mode-dependent-grant-set-form-fields'

import { buildArmorProficiencyGrantComboboxFilters } from './armor-proficiency-combobox-filters.lib'
import { ARMOR_PROFICIENCY_GRANT_MODES } from './armor-proficiency-grant-mode.lib'
import { ARMOR_PROFICIENCY_GRANT_MODE_LABELS } from './armor-proficiency-grant-form-labels'

export type LevelZeroArmorProficiencyGrantSetFieldOptions = Omit<
  ModeDependentGrantSetFieldOptions,
  'modes' | 'modeLabels' | 'categoryMode' | 'specificMode' | 'emptyMode'
>

/** Level-0 NPC armor grant set (none / categories / specific) with dual combobox filters. */
export function levelZeroArmorProficiencyGrantSetField(
  options: LevelZeroArmorProficiencyGrantSetFieldOptions,
) {
  return modeDependentGrantSetField({
    ...options,
    itemsNoun: options.itemsNoun ?? proficiencyDomainFieldNoun('armor'),
    modes: ARMOR_PROFICIENCY_GRANT_MODES,
    modeLabels: ARMOR_PROFICIENCY_GRANT_MODE_LABELS,
    categoryMode: 'categories',
    specificMode: 'specific',
    emptyMode: 'none',
    itemsCombobox: {
      filterSelects: buildArmorProficiencyGrantComboboxFilters(),
      ...options.itemsCombobox,
    },
  })
}
