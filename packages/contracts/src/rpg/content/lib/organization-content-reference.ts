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

/** Build Mongo equality fragment — single construction site. */
export function organizationContentReferenceMatch(
  descriptor: OrganizationContentReferenceDescriptor,
  value: string,
): Record<string, unknown> {
  return { [descriptor.path]: value }
}
