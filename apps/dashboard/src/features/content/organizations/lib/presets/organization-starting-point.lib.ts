import {
  applyOrganizationAuthoringPreset,
  buildOrganizationPresetOwnedEditableSnapshot,
  listOrganizationPresetOwnedEditableDivergentFieldKeys,
  ORGANIZATION_AUTHORING_PRESET_IDS,
  resolveOrganizationPresetMemberClassAffinityIds,
  resolveOrganizationPresetMemberNpcTemplateId,
  organizationMembershipTitleCatalogMatchesPresetSnapshot,
  snapshotOrganizationMembershipTitlesFromPreset,
  type CharacterClass,
  type OrganizationAuthoringPresetId,
  type OrganizationMembershipTitleDefinition,
  type OrganizationPresetOwnedEditableFieldKey,
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
    npcTemplateId?: ReturnType<typeof resolveOrganizationPresetMemberNpcTemplateId>
    titles: OrganizationMembershipTitleDefinition[]
  }
}

/** Materializes taxonomy, class affinities, and membership titles for a starting point. */
export function materializeOrganizationStartingPointPatch(
  presetId: OrganizationAuthoringPresetId,
  discoverableClasses: readonly CharacterClass[],
): OrganizationStartingPointMaterializedPatch {
  const recipe = applyOrganizationAuthoringPreset(presetId)
  const npcTemplateId = resolveOrganizationPresetMemberNpcTemplateId(presetId)
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
      ...(npcTemplateId !== undefined ? { npcTemplateId } : {}),
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
    [organizationFieldPath(prefix, 'members.npcTemplateId')]: materialized.members.npcTemplateId,
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
    ...readNpcTemplateId(values, prefix),
  }
}

function readStringField(values: Record<string, unknown>, path: string): string | undefined {
  const direct = values[path]
  if (typeof direct === 'string' && direct.length > 0) return direct

  const segments = path.split('.')
  let current: unknown = values
  for (const segment of segments) {
    if (!current || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[segment]
  }
  return typeof current === 'string' && current.length > 0 ? current : undefined
}

function readNpcTemplateId(
  values: Record<string, unknown>,
  prefix?: string,
):
  | { npcTemplateId: OrganizationPresetOwnedEditableSnapshot['npcTemplateId'] }
  | Record<string, never> {
  const value = readStringField(values, organizationFieldPath(prefix, 'members.npcTemplateId'))
  if (!value) return {}
  return { npcTemplateId: value as OrganizationPresetOwnedEditableSnapshot['npcTemplateId'] }
}

const ORGANIZATION_STARTING_POINT_OVERWRITE_FIELD_LABELS: Record<
  OrganizationPresetOwnedEditableFieldKey,
  string
> = {
  organizationDomain: 'Domain',
  organizationForm: 'Form',
  functions: 'Functions',
  practices: 'Practices',
  classAffinityIds: 'Classes',
  npcTemplateId: 'Default NPC role',
}

const ORGANIZATION_STARTING_POINT_MEMBERSHIP_TITLES_OVERWRITE_LABEL = 'Membership titles' as const

function readOrganizationMembershipTitles(
  values: Record<string, unknown>,
  prefix?: string,
): OrganizationMembershipTitleDefinition[] | undefined {
  const path = organizationFieldPath(prefix, 'members.titles')
  const direct = values[path]
  if (Array.isArray(direct)) {
    return direct as OrganizationMembershipTitleDefinition[]
  }
  const segments = path.split('.')
  if (segments.length < 2) {
    return undefined
  }
  let current: unknown = values
  for (const segment of segments) {
    if (!current || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[segment]
  }
  return Array.isArray(current) ? (current as OrganizationMembershipTitleDefinition[]) : undefined
}

export function organizationMembershipTitlesDivergeFromPreset(
  values: Record<string, unknown>,
  options: { prefix?: string; presetId: OrganizationAuthoringPresetId },
): boolean {
  const titles = readOrganizationMembershipTitles(values, options.prefix)
  if (!titles || titles.length === 0) {
    return false
  }
  return !organizationMembershipTitleCatalogMatchesPresetSnapshot(titles, options.presetId)
}

function resolvePresetOwnedEditableSnapshot(
  presetId: OrganizationAuthoringPresetId,
  discoverableClasses: readonly CharacterClass[],
): OrganizationPresetOwnedEditableSnapshot {
  return buildOrganizationPresetOwnedEditableSnapshot(
    presetId,
    resolveOrganizationPresetMemberClassAffinityIds(presetId, discoverableClasses),
  )
}

/**
 * Field labels for the change-starting-point confirm dialog — customized values that
 * differ from the incoming preset (stable Domain → Form → Functions → Practices → Classes).
 */
export function listOrganizationStartingPointConfirmOverwriteFieldLabels(
  values: Record<string, unknown>,
  options: {
    prefix?: string
    currentPresetId: OrganizationAuthoringPresetId
    nextPresetId: OrganizationAuthoringPresetId
    discoverableClasses: readonly CharacterClass[]
  },
): string[] {
  const current = readOrganizationPresetOwnedEditableSnapshot(values, options.prefix)
  if (!current) {
    return []
  }
  const fromCurrentPreset = resolvePresetOwnedEditableSnapshot(
    options.currentPresetId,
    options.discoverableClasses,
  )
  const fromIncomingPreset = resolvePresetOwnedEditableSnapshot(
    options.nextPresetId,
    options.discoverableClasses,
  )
  const customizedKeys = listOrganizationPresetOwnedEditableDivergentFieldKeys(
    current,
    fromCurrentPreset,
  )
  const customizedKeySet = new Set(customizedKeys)
  const overwriteKeys = listOrganizationPresetOwnedEditableDivergentFieldKeys(
    current,
    fromIncomingPreset,
  )
  const profileLabels = overwriteKeys
    .filter((key) => customizedKeySet.has(key))
    .map((key) => ORGANIZATION_STARTING_POINT_OVERWRITE_FIELD_LABELS[key])

  if (
    organizationMembershipTitlesDivergeFromPreset(values, {
      prefix: options.prefix,
      presetId: options.currentPresetId,
    }) &&
    !profileLabels.includes(ORGANIZATION_STARTING_POINT_MEMBERSHIP_TITLES_OVERWRITE_LABEL)
  ) {
    return [...profileLabels, ORGANIZATION_STARTING_POINT_MEMBERSHIP_TITLES_OVERWRITE_LABEL]
  }

  return profileLabels
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
  const profileCustomized = !organizationPresetOwnedEditableMatchesPreset(
    current,
    startingPointId,
    resolvedClassIds,
  )
  const titlesCustomized = organizationMembershipTitlesDivergeFromPreset(values, {
    prefix: options.prefix,
    presetId: startingPointId,
  })
  return profileCustomized || titlesCustomized
}

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
    [organizationFieldPath(prefix, 'members.npcTemplateId')]: materialized.members.npcTemplateId,
  }
}
