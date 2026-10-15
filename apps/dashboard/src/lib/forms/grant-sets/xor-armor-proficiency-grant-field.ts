import {
  xorProficiencyGrantSetField,
  type XorProficiencyGrantSetFieldOptions,
} from '@/lib/forms/mode-dependent-grant-set-form-fields'

import { buildArmorProficiencyGrantComboboxFilters } from './armor-proficiency-combobox-filters.lib'

/** Level-0 NPC armor grant set with dual combobox filters. */
export function xorArmorProficiencyGrantSetField(options: XorProficiencyGrantSetFieldOptions) {
  return xorProficiencyGrantSetField({
    ...options,
    itemsCombobox: { filterSelects: buildArmorProficiencyGrantComboboxFilters() },
  })
}
