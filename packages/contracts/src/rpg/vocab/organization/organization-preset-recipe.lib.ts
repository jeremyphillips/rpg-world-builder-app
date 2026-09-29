import type { OrganizationForm } from './form'
import type { OrganizationFunction } from './function'
import type { OrganizationPractice } from './practice'
import type { OrganizationDomain } from './domain'
import {
  applyOrganizationAuthoringPreset,
  type OrganizationAuthoringPresetId,
} from './authoring-preset'

/** Editable organization fields copied from a familiar starting point (excludes species). */
export type OrganizationPresetOwnedEditableSnapshot = {
  organizationDomain: OrganizationDomain
  organizationForm?: OrganizationForm
  functions: readonly OrganizationFunction[]
  practices: readonly OrganizationPractice[]
  classAffinityIds: readonly string[]
}

export function buildOrganizationPresetOwnedEditableSnapshot(
  presetId: OrganizationAuthoringPresetId,
  classAffinityIds: readonly string[],
): OrganizationPresetOwnedEditableSnapshot {
  const recipe = applyOrganizationAuthoringPreset(presetId)
  return {
    organizationDomain: recipe.organizationDomain,
    ...(recipe.organizationForm !== undefined ? { organizationForm: recipe.organizationForm } : {}),
    functions: recipe.functions,
    practices: recipe.practices,
    classAffinityIds,
  }
}

function normalizeOptionalForm(value: OrganizationForm | undefined): OrganizationForm | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function sortedUniqueStrings(values: readonly string[]): string[] {
  return [...new Set(values)].sort()
}

function sortedEnumValues<T extends string>(values: readonly T[]): T[] {
  return [...values].sort()
}

/** Compares preset-owned editable fields using semantic equality (order-insensitive arrays). */
export function organizationPresetOwnedEditableMatchesRecipe(
  current: OrganizationPresetOwnedEditableSnapshot,
  expected: OrganizationPresetOwnedEditableSnapshot,
): boolean {
  if (current.organizationDomain !== expected.organizationDomain) {
    return false
  }
  if (
    normalizeOptionalForm(current.organizationForm) !==
    normalizeOptionalForm(expected.organizationForm)
  ) {
    return false
  }
  const currentFunctions = sortedEnumValues(current.functions)
  const expectedFunctions = sortedEnumValues(expected.functions)
  if (
    currentFunctions.length !== expectedFunctions.length ||
    currentFunctions.some((value, index) => value !== expectedFunctions[index])
  ) {
    return false
  }
  const currentPractices = sortedEnumValues(current.practices)
  const expectedPractices = sortedEnumValues(expected.practices)
  if (
    currentPractices.length !== expectedPractices.length ||
    currentPractices.some((value, index) => value !== expectedPractices[index])
  ) {
    return false
  }
  const currentClasses = sortedUniqueStrings(current.classAffinityIds)
  const expectedClasses = sortedUniqueStrings(expected.classAffinityIds)
  if (
    currentClasses.length !== expectedClasses.length ||
    currentClasses.some((value, index) => value !== expectedClasses[index])
  ) {
    return false
  }
  return true
}

export function organizationPresetOwnedEditableMatchesPreset(
  current: OrganizationPresetOwnedEditableSnapshot,
  presetId: OrganizationAuthoringPresetId,
  resolvedClassAffinityIds: readonly string[],
): boolean {
  const expected = buildOrganizationPresetOwnedEditableSnapshot(presetId, resolvedClassAffinityIds)
  return organizationPresetOwnedEditableMatchesRecipe(current, expected)
}

/** Stable compare order for preset-owned editable fields. */
export type OrganizationPresetOwnedEditableFieldKey =
  | 'organizationDomain'
  | 'organizationForm'
  | 'functions'
  | 'practices'
  | 'classAffinityIds'

const ORGANIZATION_PRESET_OWNED_EDITABLE_FIELD_KEY_ORDER = [
  'organizationDomain',
  'organizationForm',
  'functions',
  'practices',
  'classAffinityIds',
] as const satisfies readonly OrganizationPresetOwnedEditableFieldKey[]

function practicesDiffer(
  current: readonly OrganizationPractice[],
  expected: readonly OrganizationPractice[],
): boolean {
  const currentPractices = sortedEnumValues(current)
  const expectedPractices = sortedEnumValues(expected)
  return (
    currentPractices.length !== expectedPractices.length ||
    currentPractices.some((value, index) => value !== expectedPractices[index])
  )
}

function functionsDiffer(
  current: readonly OrganizationFunction[],
  expected: readonly OrganizationFunction[],
): boolean {
  const currentFunctions = sortedEnumValues(current)
  const expectedFunctions = sortedEnumValues(expected)
  return (
    currentFunctions.length !== expectedFunctions.length ||
    currentFunctions.some((value, index) => value !== expectedFunctions[index])
  )
}

function classAffinityIdsDiffer(current: readonly string[], expected: readonly string[]): boolean {
  const currentClasses = sortedUniqueStrings(current)
  const expectedClasses = sortedUniqueStrings(expected)
  return (
    currentClasses.length !== expectedClasses.length ||
    currentClasses.some((value, index) => value !== expectedClasses[index])
  )
}

/** Lists preset-owned editable fields whose values differ from `expected` (semantic equality). */
export function listOrganizationPresetOwnedEditableDivergentFieldKeys(
  current: OrganizationPresetOwnedEditableSnapshot,
  expected: OrganizationPresetOwnedEditableSnapshot,
): OrganizationPresetOwnedEditableFieldKey[] {
  const divergent = new Set<OrganizationPresetOwnedEditableFieldKey>()
  if (current.organizationDomain !== expected.organizationDomain) {
    divergent.add('organizationDomain')
  }
  if (
    normalizeOptionalForm(current.organizationForm) !==
    normalizeOptionalForm(expected.organizationForm)
  ) {
    divergent.add('organizationForm')
  }
  if (functionsDiffer(current.functions, expected.functions)) {
    divergent.add('functions')
  }
  if (practicesDiffer(current.practices, expected.practices)) {
    divergent.add('practices')
  }
  if (classAffinityIdsDiffer(current.classAffinityIds, expected.classAffinityIds)) {
    divergent.add('classAffinityIds')
  }
  return ORGANIZATION_PRESET_OWNED_EDITABLE_FIELD_KEY_ORDER.filter((key) => divergent.has(key))
}
