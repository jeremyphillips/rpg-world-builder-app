import {
  grantSetModeFromBuckets,
  isMixedGrantSet,
  isTransientDualBranchFormState,
  proficiencyGrantSetsEqual,
  projectGrantSetFromMode,
  PROFICIENCY_GRANT_SET_MODES,
  type ProficiencyGrantSetBuckets,
  type ProficiencyGrantSetMode,
} from './proficiency-grant-set-mode.lib'

/** Weapon proficiency grant authoring modes (none / categories / specific). */
export const WEAPON_PROFICIENCY_GRANT_MODES = PROFICIENCY_GRANT_SET_MODES

export type WeaponProficiencyGrantMode = ProficiencyGrantSetMode

export type WeaponProficiencyGrantBuckets = ProficiencyGrantSetBuckets

/** Persisted grants only — both branches non-empty. Do not use on raw RHF buckets while editing. */
export const isMixedWeaponProficiencyGrantSet = isMixedGrantSet

export type WeaponProficiencyModeFromGrantSetResult =
  | { kind: 'resolved'; mode: WeaponProficiencyGrantMode }
  | { kind: 'mixed' }

/** Infer authoring mode from a stored grant set. Never call mixed detection on transient form buckets. */
export function weaponProficiencyModeFromGrantSet(
  persistedGrant: WeaponProficiencyGrantBuckets,
): WeaponProficiencyModeFromGrantSetResult {
  return grantSetModeFromBuckets(persistedGrant)
}

/** Serialize, validate, and preview — active mode only; inactive branch is dropped. Does not mutate input. */
export function weaponProficiencyGrantSetFromMode(
  mode: WeaponProficiencyGrantMode,
  formBuckets: WeaponProficiencyGrantBuckets,
): { categories: string[]; items: string[] } {
  return projectGrantSetFromMode(mode, formBuckets)
}

export { isTransientDualBranchFormState, proficiencyGrantSetsEqual }
