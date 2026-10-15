/** Weapon proficiency grant authoring modes (none / categories / specific). */
export const WEAPON_PROFICIENCY_GRANT_MODES = ['none', 'categories', 'specific'] as const

export type WeaponProficiencyGrantMode = (typeof WEAPON_PROFICIENCY_GRANT_MODES)[number]

export type WeaponProficiencyGrantBuckets = {
  categories: readonly string[]
  items: readonly string[]
}

/** Persisted grants only — both branches non-empty. Do not use on raw RHF buckets while editing. */
export function isMixedWeaponProficiencyGrantSet(grant: WeaponProficiencyGrantBuckets): boolean {
  return grant.categories.length > 0 && grant.items.length > 0
}

export type WeaponProficiencyModeFromGrantSetResult =
  | { kind: 'resolved'; mode: WeaponProficiencyGrantMode }
  | { kind: 'mixed' }

/** Infer authoring mode from a stored grant set. Never call mixed detection on transient form buckets. */
export function weaponProficiencyModeFromGrantSet(
  persistedGrant: WeaponProficiencyGrantBuckets,
): WeaponProficiencyModeFromGrantSetResult {
  if (isMixedWeaponProficiencyGrantSet(persistedGrant)) {
    return { kind: 'mixed' }
  }
  if (persistedGrant.items.length > 0) {
    return { kind: 'resolved', mode: 'specific' }
  }
  if (persistedGrant.categories.length > 0) {
    return { kind: 'resolved', mode: 'categories' }
  }
  return { kind: 'resolved', mode: 'none' }
}

/** Serialize, validate, and preview — active mode only; inactive branch is dropped. Does not mutate input. */
export function weaponProficiencyGrantSetFromMode(
  mode: WeaponProficiencyGrantMode,
  formBuckets: WeaponProficiencyGrantBuckets,
): { categories: string[]; items: string[] } {
  switch (mode) {
    case 'none':
      return { categories: [], items: [] }
    case 'categories':
      return { categories: [...formBuckets.categories], items: [] }
    case 'specific':
      return { categories: [], items: [...formBuckets.items] }
  }
}

/** Reversible mode switches may leave both branches populated — always allowed while editing. */
export function isTransientDualBranchFormState(
  mode: WeaponProficiencyGrantMode,
  formBuckets: WeaponProficiencyGrantBuckets,
): boolean {
  if (mode === 'none') return false
  return formBuckets.categories.length > 0 && formBuckets.items.length > 0
}

export function proficiencyGrantSetsEqual(
  a: WeaponProficiencyGrantBuckets,
  b: WeaponProficiencyGrantBuckets,
): boolean {
  return (
    a.categories.length === b.categories.length &&
    a.items.length === b.items.length &&
    a.categories.every((value, index) => value === b.categories[index]) &&
    a.items.every((value, index) => value === b.items[index])
  )
}
