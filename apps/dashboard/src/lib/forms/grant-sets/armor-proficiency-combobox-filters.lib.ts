import { ARMOR_CATEGORIES, ARMOR_CATEGORY_ENTRIES } from '@rpg/contracts'
import { toOptions, type ComboboxFilterDimensionConfig } from '@rpg/ui/form'

import {
  ARMOR_PROFICIENCY_CATEGORY_FILTER_ALL_LABEL,
  ARMOR_PROFICIENCY_CATEGORY_FILTER_ARIA,
  ARMOR_PROFICIENCY_STEALTH_FILTER_ALL_LABEL,
  ARMOR_PROFICIENCY_STEALTH_FILTER_ARIA,
  ARMOR_STEALTH_FILTER_LABELS,
  ARMOR_STEALTH_FILTER_SLUGS,
} from './armor-proficiency-grant-form-labels'

export const ARMOR_PROFICIENCY_FILTER_KEYS = {
  category: 'category',
  stealth: 'stealth',
} as const

const armorCategoryOptions = toOptions(
  ARMOR_CATEGORIES,
  Object.fromEntries(ARMOR_CATEGORIES.map((c) => [c, ARMOR_CATEGORY_ENTRIES[c].label])) as Record<
    (typeof ARMOR_CATEGORIES)[number],
    string
  >,
)

const armorStealthOptions = toOptions(ARMOR_STEALTH_FILTER_SLUGS, ARMOR_STEALTH_FILTER_LABELS)

export function buildArmorProficiencyGrantComboboxFilters(): readonly ComboboxFilterDimensionConfig[] {
  return [
    {
      filterKey: ARMOR_PROFICIENCY_FILTER_KEYS.category,
      ariaLabel: ARMOR_PROFICIENCY_CATEGORY_FILTER_ARIA,
      options: armorCategoryOptions,
      allOptionLabel: ARMOR_PROFICIENCY_CATEGORY_FILTER_ALL_LABEL,
    },
    {
      filterKey: ARMOR_PROFICIENCY_FILTER_KEYS.stealth,
      ariaLabel: ARMOR_PROFICIENCY_STEALTH_FILTER_ARIA,
      options: armorStealthOptions,
      allOptionLabel: ARMOR_PROFICIENCY_STEALTH_FILTER_ALL_LABEL,
    },
  ]
}
