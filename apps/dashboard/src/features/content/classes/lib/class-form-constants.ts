/** Class weapon proficiency authoring mode (categories vs named weapons). */
export const WEAPON_PROFICIENCY_MODES = ['categories', 'specific'] as const

export type WeaponProficiencyMode = (typeof WEAPON_PROFICIENCY_MODES)[number]

/** Class armor proficiency authoring mode (categories vs named armor). */
export const ARMOR_PROFICIENCY_MODES = ['categories', 'specific'] as const

export type ArmorProficiencyMode = (typeof ARMOR_PROFICIENCY_MODES)[number]
