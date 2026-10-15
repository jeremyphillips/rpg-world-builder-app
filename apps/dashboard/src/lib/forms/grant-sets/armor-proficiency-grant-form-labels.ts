import type { ArmorProficiencyGrantMode } from './armor-proficiency-grant-mode.lib'

/** Grant-set editor mode labels (level-0 armor grants). */
export const ARMOR_PROFICIENCY_GRANT_MODE_LABELS = {
  none: 'None',
  categories: 'Categories',
  specific: 'Specific armor',
} as const satisfies Record<ArmorProficiencyGrantMode, string>

/** Grant-set editor copy for armor proficiency combobox filters (not choice-grant pool UI). */
export const ARMOR_PROFICIENCY_CATEGORY_FILTER_ARIA = 'Filter armor by category'
export const ARMOR_PROFICIENCY_STEALTH_FILTER_ARIA = 'Filter armor by stealth'
export const ARMOR_PROFICIENCY_CATEGORY_FILTER_ALL_LABEL = 'All categories'
export const ARMOR_PROFICIENCY_STEALTH_FILTER_ALL_LABEL = 'All stealth'

export const ARMOR_PROFICIENCY_COMBOBOX_STEALTH_SLUGS = ['none', 'disadvantage'] as const

export const ARMOR_PROFICIENCY_COMBOBOX_STEALTH_LABELS: Record<
  (typeof ARMOR_PROFICIENCY_COMBOBOX_STEALTH_SLUGS)[number],
  string
> = {
  none: 'No stealth disadvantage',
  disadvantage: 'Stealth disadvantage',
}
