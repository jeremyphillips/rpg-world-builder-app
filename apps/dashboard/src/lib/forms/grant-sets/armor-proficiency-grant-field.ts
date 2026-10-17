import { proficiencyDomainFieldNoun } from '@rpg/contracts'

import {
  modeDependentGrantSetField,
  type ModeDependentGrantSetFieldOptions,
} from '@/lib/forms/mode-dependent-grant-set-form-fields'

import { buildArmorProficiencyGrantComboboxFilters } from './armor-proficiency-combobox-filters.lib'

export type ArmorProficiencyGrantSetFieldOptions = ModeDependentGrantSetFieldOptions

/** Class armor proficiency grant-set field with dual combobox filters. */
export function armorProficiencyGrantSetField(options: ArmorProficiencyGrantSetFieldOptions) {
  return modeDependentGrantSetField({
    ...options,
    itemsNoun: options.itemsNoun ?? proficiencyDomainFieldNoun('armor'),
    itemsCombobox: {
      filterSelects: buildArmorProficiencyGrantComboboxFilters(),
      ...options.itemsCombobox,
    },
  })
}
