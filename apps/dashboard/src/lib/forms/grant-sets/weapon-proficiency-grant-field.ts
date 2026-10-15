import {
  modeDependentGrantSetField,
  type ModeDependentGrantSetFieldOptions,
} from '@/lib/forms/mode-dependent-grant-set-form-fields'

import { buildWeaponProficiencyGrantComboboxFilters } from './weapon-proficiency-combobox-filters.lib'

export type WeaponProficiencyGrantSetFieldOptions = ModeDependentGrantSetFieldOptions

/** Class and monster weapon proficiency grant-set field with dual combobox filters. */
export function weaponProficiencyGrantSetField(options: WeaponProficiencyGrantSetFieldOptions) {
  return modeDependentGrantSetField({
    ...options,
    itemsCombobox: { filterSelects: buildWeaponProficiencyGrantComboboxFilters() },
  })
}
