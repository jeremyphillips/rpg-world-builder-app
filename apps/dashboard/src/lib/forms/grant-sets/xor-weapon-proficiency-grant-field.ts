import {
  xorProficiencyGrantSetField,
  type XorProficiencyGrantSetFieldOptions,
} from '@/lib/forms/mode-dependent-grant-set-form-fields'

import { buildWeaponProficiencyGrantComboboxFilters } from './weapon-proficiency-combobox-filters.lib'

/** Level-0 NPC weapon grant set with dual combobox filters. */
export function xorWeaponProficiencyGrantSetField(options: XorProficiencyGrantSetFieldOptions) {
  return xorProficiencyGrantSetField({
    ...options,
    itemsCombobox: { filterSelects: buildWeaponProficiencyGrantComboboxFilters() },
  })
}
