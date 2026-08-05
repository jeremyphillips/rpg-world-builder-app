import { keysFromEntries, vocabEnumFromEntries } from '../enum-schema'
import type { GameTermEntry, VocabularyTerm } from '../types'

export const ORGANIZATION_LOCATION_CONNECTION_FAMILY_IDS = [
  'site',
  'geographic_presence',
  'territorial_authority',
] as const

export type OrganizationLocationConnectionFamily =
  (typeof ORGANIZATION_LOCATION_CONNECTION_FAMILY_IDS)[number]

export const ORGANIZATION_LOCATION_CONNECTION_FAMILY_CARDINALITY = {
  site: 'one_per_kind',
  geographic_presence: 'one_per_family',
} as const

export type OrganizationLocationConnectionFamilyCardinality =
  (typeof ORGANIZATION_LOCATION_CONNECTION_FAMILY_CARDINALITY)[keyof typeof ORGANIZATION_LOCATION_CONNECTION_FAMILY_CARDINALITY]

export const ORGANIZATION_LOCATION_CONNECTION_TERM = {
  label: 'Organization location connection',
  description:
    'How an organization relates to a location — site presence, geographic activity, or territorial authority.',
  sentence: {
    singular: 'organization location connection',
    plural: 'organization location connections',
  },
} as const satisfies VocabularyTerm

export type OrganizationLocationConnectionEntry = GameTermEntry & {
  readonly family: OrganizationLocationConnectionFamily
  readonly priority: number
  /** Max organizations per location for this kind across the campaign; null = unlimited. */
  readonly maxSubjectsPerLocation: number | null
}

export const ORGANIZATION_LOCATION_CONNECTION_ENTRIES = {
  owns: {
    label: 'Owner',
    description: 'Owns or holds title to this location.',
    family: 'site',
    priority: 50,
    maxSubjectsPerLocation: null,
  },
  tenant: {
    label: 'Tenant',
    description: 'Occupies or leases space here without owning the location.',
    family: 'site',
    priority: 40,
    maxSubjectsPerLocation: null,
  },
  operator: {
    label: 'Operator',
    description: 'Runs or manages day-to-day operations at this location.',
    family: 'site',
    priority: 30,
    maxSubjectsPerLocation: null,
  },
  headquarters: {
    label: 'Headquarters',
    description: 'Primary designated location for an organization.',
    family: 'site',
    priority: 20,
    maxSubjectsPerLocation: null,
  },
  operates_in: {
    label: 'Operates in',
    description:
      'Active organizational presence in this geographic area. Distinct from territorial authority (governs/controls/claims).',
    family: 'geographic_presence',
    priority: 10,
    maxSubjectsPerLocation: null,
  },
  governs: {
    label: 'Governs',
    description: 'Recognized political or administrative authority over this location.',
    family: 'territorial_authority',
    priority: 50,
    maxSubjectsPerLocation: 1,
  },
  controls: {
    label: 'Controls',
    description:
      'Effective or de facto control, including when control differs from the recognized government.',
    family: 'territorial_authority',
    priority: 40,
    maxSubjectsPerLocation: 1,
  },
  claims: {
    label: 'Claims',
    description:
      'Asserts a territorial claim without necessarily governing or controlling this location.',
    family: 'territorial_authority',
    priority: 30,
    maxSubjectsPerLocation: null,
  },
} as const satisfies Record<string, OrganizationLocationConnectionEntry>

export type OrganizationLocationConnectionKind =
  keyof typeof ORGANIZATION_LOCATION_CONNECTION_ENTRIES

export const ORGANIZATION_LOCATION_CONNECTION_KIND_IDS = keysFromEntries(
  ORGANIZATION_LOCATION_CONNECTION_ENTRIES,
)

export const organizationLocationConnectionKindSchema = vocabEnumFromEntries(
  ORGANIZATION_LOCATION_CONNECTION_ENTRIES,
)

/** Returns the reference entry for an organization location connection kind, if known. */
export function getOrganizationLocationConnectionEntry(
  id: string,
): OrganizationLocationConnectionEntry | undefined {
  return ORGANIZATION_LOCATION_CONNECTION_ENTRIES[id as OrganizationLocationConnectionKind]
}

/** Returns the display label for an organization location connection kind. Falls back to the raw id. */
export function getOrganizationLocationConnectionLabel(id: string): string {
  return getOrganizationLocationConnectionEntry(id)?.label ?? id
}

/** In-family precedence for ordering connection rows — higher priority first. */
export function getOrganizationLocationConnectionPriority(
  kind: OrganizationLocationConnectionKind,
): number {
  return ORGANIZATION_LOCATION_CONNECTION_ENTRIES[kind].priority
}

/** Returns max organizations per location for a kind, or null when unlimited. */
export function getOrganizationLocationConnectionMaxSubjectsPerLocation(
  kind: OrganizationLocationConnectionKind,
): number | null {
  const max = ORGANIZATION_LOCATION_CONNECTION_ENTRIES[kind].maxSubjectsPerLocation
  return max ?? null
}

/** Returns the connection family for an organization location connection kind. */
export function getOrganizationLocationConnectionFamily(
  kind: OrganizationLocationConnectionKind,
): OrganizationLocationConnectionFamily {
  return ORGANIZATION_LOCATION_CONNECTION_ENTRIES[kind].family
}
