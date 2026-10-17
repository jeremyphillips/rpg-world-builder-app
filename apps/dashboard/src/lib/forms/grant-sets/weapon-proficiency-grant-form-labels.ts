import type { WeaponProficiencyGrantMode } from './weapon-proficiency-grant-mode.lib'

/** Grant-set editor mode labels (class, monster, level-0 weapon grants). */
export const WEAPON_PROFICIENCY_GRANT_MODE_LABELS = {
  none: 'None',
  categories: 'Categories',
  specific: 'Specific weapons',
} as const satisfies Record<WeaponProficiencyGrantMode, string>

export const WEAPON_PROFICIENCY_PERSISTED_MIXED_RECONCILIATION_MESSAGE =
  'This record stores both weapon categories and specific weapons. Choose a mode to define what will be saved.'

/** Grant-set editor copy for weapon proficiency combobox filters (not choice-grant pool UI). */
export const WEAPON_PROFICIENCY_CATEGORY_FILTER_ARIA = 'Filter weapons by category'
export const WEAPON_PROFICIENCY_MODE_FILTER_ARIA = 'Filter weapons by mode'
export const WEAPON_PROFICIENCY_CATEGORY_FILTER_ALL_LABEL = 'All categories'
export const WEAPON_PROFICIENCY_MODE_FILTER_ALL_LABEL = 'All modes'
