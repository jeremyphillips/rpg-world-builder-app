export type OrganizationContentReferenceDescriptor = {
  owner: 'organization'
  path: string
  matchKey: 'id' | 'slug'
}

export function createOrganizationContentReferenceDescriptor(
  input: Pick<OrganizationContentReferenceDescriptor, 'path' | 'matchKey'>,
): OrganizationContentReferenceDescriptor {
  return { owner: 'organization', ...input }
}

export const LOCATION_ORGANIZATION_REFERENCE = createOrganizationContentReferenceDescriptor({
  path: 'connections.locations.locationId',
  matchKey: 'id',
})

export const ORGANIZATION_MEMBER_CLASS_AFFINITY_REFERENCE =
  createOrganizationContentReferenceDescriptor({
    path: 'members.classAffinityIds',
    matchKey: 'id',
  })

export const ORGANIZATION_MEMBER_SPECIES_AFFINITY_REFERENCE =
  createOrganizationContentReferenceDescriptor({
    path: 'members.speciesAffinityIds',
    matchKey: 'id',
  })

/** Build Mongo equality fragment — single construction site. */
export function organizationContentReferenceMatch(
  descriptor: OrganizationContentReferenceDescriptor,
  value: string,
): Record<string, unknown> {
  return { [descriptor.path]: value }
}
