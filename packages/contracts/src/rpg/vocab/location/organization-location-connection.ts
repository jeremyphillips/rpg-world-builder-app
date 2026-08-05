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
  territorial_authority: 'one_per_family',
} as const

export type OrganizationLocationConnectionFamilyCardinality =
  (typeof ORGANIZATION_LOCATION_CONNECTION_FAMILY_CARDINALITY)[OrganizationLocationConnectionFamily]

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
}

export const ORGANIZATION_LOCATION_CONNECTION_ENTRIES = {
  owns: {
    label: 'Owner',
    description: 'Owns or holds title to this location.',
    family: 'site',
    priority: 50,
  },
  tenant: {
    label: 'Tenant',
    description: 'Occupies or leases space here without owning the location.',
    family: 'site',
    priority: 40,
  },
  operator: {
    label: 'Operator',
    description: 'Runs or manages day-to-day operations at this location.',
    family: 'site',
    priority: 30,
  },
  headquarters: {
    label: 'Headquarters',
    description: 'Primary designated location for an organization.',
    family: 'site',
    priority: 20,
  },
  operates_in: {
    label: 'Operates in',
    description:
      'Active organizational presence in this geographic area. Distinct from territorial authority (governs/controls/claims).',
    family: 'geographic_presence',
    priority: 10,
  },
  governs: {
    label: 'Governs',
    description:
      'Exercises political or administrative authority over this region. Distinct from property or title interest (site owner).',
    family: 'territorial_authority',
    priority: 50,
  },
  controls: {
    label: 'Controls',
    description:
      'Exercises territorial authority over this region. Distinct from operational presence at a location (site operator).',
    family: 'territorial_authority',
    priority: 40,
  },
  claims: {
    label: 'Claims',
    description: 'Asserted but contested or incomplete territorial authority over this region.',
    family: 'territorial_authority',
    priority: 30,
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

/** Returns the connection family for an organization location connection kind. */
export function getOrganizationLocationConnectionFamily(
  kind: OrganizationLocationConnectionKind,
): OrganizationLocationConnectionFamily {
  return ORGANIZATION_LOCATION_CONNECTION_ENTRIES[kind].family
}
