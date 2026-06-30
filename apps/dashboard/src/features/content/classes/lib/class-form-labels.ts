import type { WeaponProficiencyMode } from './class-form-constants'

export const SAVING_THROWS_HINT = 'Select up to 2 abilities.'

export const CLASS_SKILL_OPTIONS_INFO =
  'Skill options are shared with each skill’s suggested classes. Changes here update those skill records.'

export const INDIVIDUAL_WEAPONS_TOGGLE_HINT =
  'Most classes use categories. Use individual weapons for limited weapon lists.'

export const WEAPON_PROFICIENCIES_HINT = 'Categories include all weapons in that group.'

export const WEAPON_PROFICIENCY_MODE_LABELS = {
  categories: 'Categories',
  individual: 'Individual weapons',
} as const satisfies Record<WeaponProficiencyMode, string>
