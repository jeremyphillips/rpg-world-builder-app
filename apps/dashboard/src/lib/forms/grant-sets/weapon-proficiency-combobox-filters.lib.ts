import {
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  WEAPON_MODE_ENTRIES,
  WEAPON_MODES,
} from '@rpg/contracts'
import { toOptions, type ComboboxFilterDimensionConfig } from '@rpg/ui/form'

import {
  WEAPON_PROFICIENCY_CATEGORY_FILTER_ALL_LABEL,
  WEAPON_PROFICIENCY_CATEGORY_FILTER_ARIA,
  WEAPON_PROFICIENCY_MODE_FILTER_ALL_LABEL,
  WEAPON_PROFICIENCY_MODE_FILTER_ARIA,
} from './weapon-proficiency-grant-form-labels'

export const WEAPON_PROFICIENCY_FILTER_KEYS = {
  category: 'category',
  mode: 'mode',
} as const

const weaponCategoryOptions = toOptions(
  WEAPON_CATEGORIES,
  Object.fromEntries(WEAPON_CATEGORIES.map((c) => [c, WEAPON_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof WEAPON_CATEGORIES)[number],
    string
  >,
)

const weaponModeOptions = toOptions(
  WEAPON_MODES,
  Object.fromEntries(WEAPON_MODES.map((m) => [m, WEAPON_MODE_ENTRIES[m].label])) as Record<
    (typeof WEAPON_MODES)[number],
    string
  >,
)

export function buildWeaponProficiencyGrantComboboxFilters(): readonly ComboboxFilterDimensionConfig[] {
  return [
    {
      filterKey: WEAPON_PROFICIENCY_FILTER_KEYS.category,
      ariaLabel: WEAPON_PROFICIENCY_CATEGORY_FILTER_ARIA,
      options: weaponCategoryOptions,
      allOptionLabel: WEAPON_PROFICIENCY_CATEGORY_FILTER_ALL_LABEL,
    },
    {
      filterKey: WEAPON_PROFICIENCY_FILTER_KEYS.mode,
      ariaLabel: WEAPON_PROFICIENCY_MODE_FILTER_ARIA,
      options: weaponModeOptions,
      allOptionLabel: WEAPON_PROFICIENCY_MODE_FILTER_ALL_LABEL,
    },
  ]
}
