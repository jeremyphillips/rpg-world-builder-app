/** Shared none / categories / specific grant-set authoring modes. */
export const PROFICIENCY_GRANT_SET_MODES = ['none', 'categories', 'specific'] as const

export type ProficiencyGrantSetMode = (typeof PROFICIENCY_GRANT_SET_MODES)[number]

export type ProficiencyGrantSetBuckets = {
  categories: readonly string[]
  items: readonly string[]
}

/** Persisted grants only — both branches non-empty. Do not use on raw RHF buckets while editing. */
export function isMixedGrantSet(grant: ProficiencyGrantSetBuckets): boolean {
  return grant.categories.length > 0 && grant.items.length > 0
}

export type GrantSetModeFromBucketsResult =
  | { kind: 'resolved'; mode: ProficiencyGrantSetMode }
  | { kind: 'mixed' }

/** Infer authoring mode from a stored grant set. Never call mixed detection on transient form buckets. */
export function grantSetModeFromBuckets(
  persistedGrant: ProficiencyGrantSetBuckets,
): GrantSetModeFromBucketsResult {
  if (isMixedGrantSet(persistedGrant)) {
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
export function projectGrantSetFromMode(
  mode: ProficiencyGrantSetMode,
  formBuckets: ProficiencyGrantSetBuckets,
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
  mode: ProficiencyGrantSetMode,
  formBuckets: ProficiencyGrantSetBuckets,
): boolean {
  if (mode === 'none') return false
  return formBuckets.categories.length > 0 && formBuckets.items.length > 0
}

export function proficiencyGrantSetsEqual(
  a: ProficiencyGrantSetBuckets,
  b: ProficiencyGrantSetBuckets,
): boolean {
  return (
    a.categories.length === b.categories.length &&
    a.items.length === b.items.length &&
    a.categories.every((value, index) => value === b.categories[index]) &&
    a.items.every((value, index) => value === b.items[index])
  )
}

export function hasNonEmptyGrantSet(grant: ProficiencyGrantSetBuckets): boolean {
  return grant.categories.length > 0 || grant.items.length > 0
}
