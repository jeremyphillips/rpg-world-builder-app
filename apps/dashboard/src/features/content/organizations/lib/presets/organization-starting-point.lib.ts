import {
  applyOrganizationAuthoringPreset,
  ORGANIZATION_AUTHORING_PRESET_IDS,
  resolveOrganizationPresetMemberClassAffinityIds,
  snapshotOrganizationMembershipTitlesFromPreset,
  type CharacterClass,
  type OrganizationAuthoringPresetId,
  type OrganizationMembershipTitleDefinition,
  type OrganizationPresetOwnedEditableSnapshot,
  organizationPresetOwnedEditableMatchesPreset,
} from '@rpg/contracts'

const ORGANIZATION_AUTHORING_PRESET_COMBOBOX_DESCRIPTION_PREFIX = 'Closest starting point for '

/** Combobox secondary line — drops catalog boilerplate from preset descriptions. */
export function organizationAuthoringPresetComboboxDescription(description: string): string {
  if (!description.startsWith(ORGANIZATION_AUTHORING_PRESET_COMBOBOX_DESCRIPTION_PREFIX)) {
    return description
  }
  const rest = description.slice(ORGANIZATION_AUTHORING_PRESET_COMBOBOX_DESCRIPTION_PREFIX.length)
  if (rest.length === 0) {
    return rest
  }
  return rest.charAt(0).toUpperCase() + rest.slice(1)
}

export function organizationStartingPointFieldPath(prefix?: string): string {
  return prefix ? `${prefix}.startingPointId` : 'startingPointId'
}

function organizationFieldPath(prefix: string | undefined, name: string): string {
  return prefix ? `${prefix}.${name}` : name
}

function readStringArrayField(values: Record<string, unknown>, path: string): string[] {
  const direct = values[path]
  if (Array.isArray(direct)) {
    return direct.filter((id): id is string => typeof id === 'string' && id.length > 0)
  }
  const segments = path.split('.')
  if (segments.length < 2) {
    return []
  }
  let current: unknown = values
  for (const segment of segments) {
    if (!current || typeof current !== 'object') {
      return []
    }
    current = (current as Record<string, unknown>)[segment]
  }
  if (!Array.isArray(current)) {
    return []
  }
  return current.filter((id): id is string => typeof id === 'string' && id.length > 0)
}

export function isOrganizationAuthoringPresetId(
  value: unknown,
): value is OrganizationAuthoringPresetId {
  return (
    typeof value === 'string' &&
    ORGANIZATION_AUTHORING_PRESET_IDS.includes(value as OrganizationAuthoringPresetId)
  )
}

export type OrganizationStartingPointMaterializedPatch = {
  startingPointId: OrganizationAuthoringPresetId
  organizationDomain: ReturnType<typeof applyOrganizationAuthoringPreset>['organizationDomain']
  organizationForm?: ReturnType<typeof applyOrganizationAuthoringPreset>['organizationForm']
  functions: ReturnType<typeof applyOrganizationAuthoringPreset>['functions']
  practices: ReturnType<typeof applyOrganizationAuthoringPreset>['practices']
  members: {
    classAffinityIds: string[]
    titles: OrganizationMembershipTitleDefinition[]
  }
}

/** Materializes taxonomy, class affinities, and membership titles for a starting point. */
export function materializeOrganizationStartingPointPatch(
  presetId: OrganizationAuthoringPresetId,
  discoverableClasses: readonly CharacterClass[],
): OrganizationStartingPointMaterializedPatch {
  const recipe = applyOrganizationAuthoringPreset(presetId)
  return {
    startingPointId: presetId,
    organizationDomain: recipe.organizationDomain,
    ...(recipe.organizationForm !== undefined ? { organizationForm: recipe.organizationForm } : {}),
    functions: recipe.functions,
    practices: recipe.practices,
    members: {
      classAffinityIds: resolveOrganizationPresetMemberClassAffinityIds(
        presetId,
        discoverableClasses,
      ),
      titles: snapshotOrganizationMembershipTitlesFromPreset(presetId),
    },
  }
}

/** Flat react-hook-form valueSync patch for prefixed organization create fields. */
export function buildOrganizationStartingPointValueSyncPatch(
  presetId: OrganizationAuthoringPresetId,
  options: {
    prefix?: string
    discoverableClasses: readonly CharacterClass[]
  },
): Record<string, unknown> {
  const { prefix, discoverableClasses } = options
  const materialized = materializeOrganizationStartingPointPatch(presetId, discoverableClasses)
  return {
    [organizationFieldPath(prefix, 'startingPointId')]: materialized.startingPointId,
    [organizationFieldPath(prefix, 'organizationDomain')]: materialized.organizationDomain,
    [organizationFieldPath(prefix, 'organizationForm')]: materialized.organizationForm,
    [organizationFieldPath(prefix, 'functions')]: materialized.functions,
    [organizationFieldPath(prefix, 'practices')]: materialized.practices,
    [organizationFieldPath(prefix, 'members.classAffinityIds')]:
      materialized.members.classAffinityIds,
    [organizationFieldPath(prefix, 'members.titles')]: materialized.members.titles,
  }
}

export function readOrganizationPresetOwnedEditableSnapshot(
  values: Record<string, unknown>,
  prefix?: string,
): OrganizationPresetOwnedEditableSnapshot | undefined {
  const domain = values[organizationFieldPath(prefix, 'organizationDomain')]
  if (typeof domain !== 'string' || domain.length === 0) {
    return undefined
  }
  const formValue = values[organizationFieldPath(prefix, 'organizationForm')]
  const functions = values[organizationFieldPath(prefix, 'functions')]
  const practices = values[organizationFieldPath(prefix, 'practices')]
  return {
    organizationDomain: domain as OrganizationPresetOwnedEditableSnapshot['organizationDomain'],
    ...(typeof formValue === 'string' && formValue.length > 0
      ? {
          organizationForm:
            formValue as OrganizationPresetOwnedEditableSnapshot['organizationForm'],
        }
      : {}),
    functions: Array.isArray(functions)
      ? (functions as OrganizationPresetOwnedEditableSnapshot['functions'])
      : [],
    practices: Array.isArray(practices)
      ? (practices as OrganizationPresetOwnedEditableSnapshot['practices'])
      : [],
    classAffinityIds: readStringArrayField(
      values,
      organizationFieldPath(prefix, 'members.classAffinityIds'),
    ),
  }
}

export function organizationStartingPointIsCustomized(
  values: Record<string, unknown>,
  options: {
    prefix?: string
    discoverableClasses: readonly CharacterClass[]
  },
): boolean {
  const startingPointId = values[organizationStartingPointFieldPath(options.prefix)]
  if (!isOrganizationAuthoringPresetId(startingPointId)) {
    return false
  }
  const current = readOrganizationPresetOwnedEditableSnapshot(values, options.prefix)
  if (!current) {
    return false
  }
  const resolvedClassIds = resolveOrganizationPresetMemberClassAffinityIds(
    startingPointId,
    options.discoverableClasses,
  )
  return !organizationPresetOwnedEditableMatchesPreset(current, startingPointId, resolvedClassIds)
}

/**
 * Membership titles are excluded from customized detection because create does not expose an
 * independent title editor. Extend detection before adding create-time title authoring.
 */
export const ORGANIZATION_STARTING_POINT_TITLE_DIVERGENCE_EXCLUDED_FROM_CUSTOMIZED_DETECTION =
  true as const

/** Edit-time familiar type apply — profile + class affinities only (never titles). */
export function buildOrganizationEditFamiliarTypeFormPatch(
  presetId: OrganizationAuthoringPresetId,
  discoverableClasses: readonly CharacterClass[],
  prefix?: string,
): Record<string, unknown> {
  const materialized = materializeOrganizationStartingPointPatch(presetId, discoverableClasses)
  return {
    [organizationFieldPath(prefix, 'organizationDomain')]: materialized.organizationDomain,
    [organizationFieldPath(prefix, 'organizationForm')]:
      materialized.organizationForm !== undefined ? materialized.organizationForm : null,
    [organizationFieldPath(prefix, 'functions')]: materialized.functions,
    [organizationFieldPath(prefix, 'practices')]: materialized.practices,
    [organizationFieldPath(prefix, 'members.classAffinityIds')]:
      materialized.members.classAffinityIds,
  }
}
