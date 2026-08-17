/** Minimal lean organization shape used by content-usage extractors. */
export type OrganizationContentUsageHit = {
  _id: unknown
  name: string
  slug: string
  memberClassAffinityIds?: string[]
  memberSpeciesAffinityIds?: string[]
  connections?: {
    locations?: Array<{ locationId?: string }>
  }
}

function organizationIdFromHit(hit: OrganizationContentUsageHit): string {
  return String(hit._id)
}

function nonEmptyStrings(values: readonly (string | undefined)[]): readonly string[] {
  return values.filter((value): value is string => typeof value === 'string' && value.length > 0)
}

const ORGANIZATION_DESCRIPTOR_EXTRACTORS: Record<
  string,
  (hit: OrganizationContentUsageHit) => readonly string[]
> = {
  'connections.locations.locationId': (hit) =>
    nonEmptyStrings((hit.connections?.locations ?? []).map((entry) => entry.locationId)),
  memberClassAffinityIds: (hit) => nonEmptyStrings(hit.memberClassAffinityIds ?? []),
  memberSpeciesAffinityIds: (hit) => nonEmptyStrings(hit.memberSpeciesAffinityIds ?? []),
}

/** Extract referenced values along a single organization path descriptor. */
export function extractIdsFromOrganizationDescriptor(
  hit: OrganizationContentUsageHit,
  path: string,
): readonly string[] {
  const extract = ORGANIZATION_DESCRIPTOR_EXTRACTORS[path]
  if (!extract) {
    throw new Error(`Unsupported organization content reference path: ${path}`)
  }
  return extract(hit)
}

export { organizationIdFromHit }
