import type { LocationConnectedPartySectionGroup } from '@rpg/contracts'

import {
  TERRITORIAL_AUTHORITY_SECTION_EMPTY,
  TERRITORIAL_AUTHORITY_SECTION_HEADING,
  TERRITORIAL_AUTHORITY_SECTION_HELPER,
} from './location-connection-surface-copy'

export const LOCATION_CONNECTED_PARTIES_SECTION_LABELS: Record<
  LocationConnectedPartySectionGroup,
  string
> = {
  territorial_authority: TERRITORIAL_AUTHORITY_SECTION_HEADING,
  people_and_organizations: 'People & organizations',
}

export const LOCATION_CONNECTED_PARTIES_SECTION_HELPERS: Record<
  LocationConnectedPartySectionGroup,
  string
> = {
  territorial_authority: TERRITORIAL_AUTHORITY_SECTION_HELPER,
  people_and_organizations:
    'Characters and organizations with ownership, occupancy, operations, or geographic presence here.',
}

export const LOCATION_CONNECTED_PARTIES_EMPTY_TEXT: Record<
  LocationConnectedPartySectionGroup,
  string
> = {
  territorial_authority: TERRITORIAL_AUTHORITY_SECTION_EMPTY,
  people_and_organizations: 'No people or organizations linked yet.',
}
