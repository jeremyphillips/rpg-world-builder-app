import type { LocationAuthoringType } from '../../locations/lib/location-authoring-type'

export type ActiveNestedCreateIntent =
  | { target: 'organization' }
  | { target: 'location'; authoringType: LocationAuthoringType }
  | { target: 'character' }

export type NestedCreateHandoffFailureStatus = 'not-found' | 'ineligible' | 'unsupported'

export type NestedCreateHandoffResult =
  | {
      status: 'selected'
      organizationId?: string
      locationId?: string
      characterId?: string
    }
  | { status: NestedCreateHandoffFailureStatus }
