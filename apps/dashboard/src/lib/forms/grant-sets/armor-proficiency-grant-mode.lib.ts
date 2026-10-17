import {
  grantSetModeFromBuckets,
  isMixedGrantSet,
  projectGrantSetFromMode,
  PROFICIENCY_GRANT_SET_MODES,
  type ProficiencyGrantSetBuckets,
  type ProficiencyGrantSetMode,
} from './proficiency-grant-set-mode.lib'

/** Armor proficiency grant authoring modes (none / categories / specific). */
export const ARMOR_PROFICIENCY_GRANT_MODES = PROFICIENCY_GRANT_SET_MODES

export type ArmorProficiencyGrantMode = ProficiencyGrantSetMode

export type ArmorProficiencyGrantBuckets = ProficiencyGrantSetBuckets

export const isMixedArmorProficiencyGrantSet = isMixedGrantSet

export type ArmorProficiencyModeFromGrantSetResult =
  | { kind: 'resolved'; mode: ArmorProficiencyGrantMode }
  | { kind: 'mixed' }

export function armorProficiencyModeFromGrantSet(
  persistedGrant: ArmorProficiencyGrantBuckets,
): ArmorProficiencyModeFromGrantSetResult {
  return grantSetModeFromBuckets(persistedGrant)
}

export function armorProficiencyGrantSetFromMode(
  mode: ArmorProficiencyGrantMode,
  formBuckets: ArmorProficiencyGrantBuckets,
): { categories: string[]; items: string[] } {
  return projectGrantSetFromMode(mode, formBuckets)
}
