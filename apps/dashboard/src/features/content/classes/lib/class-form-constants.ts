/** Class weapon proficiency authoring mode (categories vs named weapons). */
export const WEAPON_PROFICIENCY_MODES = ['categories', 'individual'] as const

export type WeaponProficiencyMode = (typeof WEAPON_PROFICIENCY_MODES)[number]
