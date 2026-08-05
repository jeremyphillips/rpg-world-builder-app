import {
  LOCATION_PARTY_ASSOCIATION_FAMILY_LABEL,
  LOCATION_TERRITORIAL_AUTHORITY_FAMILY_LABEL,
} from '../../lib/location-relationship-family-labels'

export const ORGANIZATION_CONNECTED_REGION_PREVIEW_COUNT = 4

export const ORGANIZATION_CONNECTED_REGIONS_LOAD_ERROR =
  'Could not load connected regions for this organization.'

export const ORGANIZATION_CONNECTED_REGION_FAMILY_LABELS = {
  territorialAuthority: LOCATION_TERRITORIAL_AUTHORITY_FAMILY_LABEL,
  partyAssociation: LOCATION_PARTY_ASSOCIATION_FAMILY_LABEL,
} as const
