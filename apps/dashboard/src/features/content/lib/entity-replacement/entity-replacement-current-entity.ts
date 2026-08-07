export type EntityReplacementCurrentSnapshot = {
  heading: string
  subheading?: string
  imageKey?: string
  unavailable?: boolean
}

export const ENTITY_REPLACEMENT_CURRENT_UNAVAILABLE_MESSAGE =
  'The current linked entity could not be loaded. Resolve the reference before changing the target.' as const

export const ENTITY_REPLACEMENT_UNAVAILABLE_LOCATION_HEADING = 'Unavailable location' as const
export const ENTITY_REPLACEMENT_UNAVAILABLE_ORGANIZATION_HEADING =
  'Unavailable organization' as const
