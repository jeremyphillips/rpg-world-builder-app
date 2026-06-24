/** Radix Select rejects empty-string item values; use this for "no subclass choice level". */
export const SUBCLASS_CHOICE_LEVEL_NONE = 'none'

/** Class weapon proficiency authoring mode (categories vs named weapons). */
export const WEAPON_PROFICIENCY_MODES = ['categories', 'individual'] as const

export type WeaponProficiencyMode = (typeof WEAPON_PROFICIENCY_MODES)[number]

export const WEAPON_PROFICIENCY_MODE_LABELS = {
  categories: 'Categories',
  individual: 'Individual weapons',
} as const satisfies Record<WeaponProficiencyMode, string>
