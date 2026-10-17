export {
  WEAPON_PROFICIENCY_GRANT_MODES as WEAPON_PROFICIENCY_MODES,
  type WeaponProficiencyGrantMode as WeaponProficiencyMode,
} from '@/lib/forms/grant-sets/weapon-proficiency-grant-mode.lib'

/** Class armor proficiency authoring mode (categories vs named armor). */
export const ARMOR_PROFICIENCY_MODES = ['categories', 'specific'] as const

export type ArmorProficiencyMode = (typeof ARMOR_PROFICIENCY_MODES)[number]
