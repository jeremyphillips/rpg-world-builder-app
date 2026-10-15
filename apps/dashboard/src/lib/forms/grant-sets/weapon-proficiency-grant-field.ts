import {
  modeDependentGrantSetField,
  type ModeDependentGrantSetFieldOptions,
} from '@/lib/forms/mode-dependent-grant-set-form-fields'

import { buildWeaponProficiencyGrantComboboxFilters } from './weapon-proficiency-combobox-filters.lib'
import { WEAPON_PROFICIENCY_GRANT_MODES } from './weapon-proficiency-grant-mode.lib'
import { WEAPON_PROFICIENCY_GRANT_MODE_LABELS } from './weapon-proficiency-grant-form-labels'

export type WeaponProficiencyGrantSetFieldOptions = Omit<
  ModeDependentGrantSetFieldOptions,
  'modes' | 'modeLabels' | 'categoryMode' | 'specificMode' | 'emptyMode'
>

/** Class, monster, and level-0 weapon proficiency grant-set field (none / categories / specific). */
export function weaponProficiencyGrantSetField(options: WeaponProficiencyGrantSetFieldOptions) {
  return modeDependentGrantSetField({
    ...options,
    modes: WEAPON_PROFICIENCY_GRANT_MODES,
    modeLabels: WEAPON_PROFICIENCY_GRANT_MODE_LABELS,
    categoryMode: 'categories',
    specificMode: 'specific',
    emptyMode: 'none',
    itemsCombobox: {
      filterSelects: buildWeaponProficiencyGrantComboboxFilters(),
      ...options.itemsCombobox,
    },
  })
}
