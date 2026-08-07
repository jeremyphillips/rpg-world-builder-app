export type RelationshipDrawerCurrentEntitySnapshot = {
  heading: string
  subheading?: string
  imageKey?: string
  unavailable?: boolean
}

export const RELATIONSHIP_DRAWER_UNAVAILABLE_LOCATION_HEADING = 'Unavailable location' as const
export const RELATIONSHIP_DRAWER_UNAVAILABLE_ORGANIZATION_HEADING =
  'Unavailable organization' as const
export const RELATIONSHIP_DRAWER_CURRENT_ENDPOINT_UNAVAILABLE_MESSAGE =
  'The current linked entity could not be loaded. Resolve the reference before changing the target.' as const
