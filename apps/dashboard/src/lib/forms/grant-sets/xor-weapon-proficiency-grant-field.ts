import {
  xorProficiencyGrantSetField,
  type XorProficiencyGrantSetFieldOptions,
} from '@/lib/forms/mode-dependent-grant-set-form-fields'

import { buildWeaponProficiencyGrantComboboxFilters } from './weapon-proficiency-combobox-filters.lib'

/**
 * @deprecated Use `weaponProficiencyGrantSetField` — level-0 weapons share the 3-mode grant enum.
 */
export function xorWeaponProficiencyGrantSetField(options: XorProficiencyGrantSetFieldOptions) {
  return xorProficiencyGrantSetField({
    ...options,
    itemsCombobox: { filterSelects: buildWeaponProficiencyGrantComboboxFilters() },
  })
}
