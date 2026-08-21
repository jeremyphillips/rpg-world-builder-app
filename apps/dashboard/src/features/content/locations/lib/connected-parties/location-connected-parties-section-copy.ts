import type { LocationConnectedPartySectionGroup } from '@rpg/contracts'

import {
  TERRITORIAL_AUTHORITY_SECTION_EMPTY,
  TERRITORIAL_AUTHORITY_SECTION_HEADING,
  TERRITORIAL_AUTHORITY_SECTION_HELPER,
} from './location-connection-surface-copy'

export const LOCATION_PEOPLE_QUICK_NPC_CREATE_UNAVAILABLE_MESSAGE =
  'Quick NPC creation is unavailable — campaign build data failed to load.'

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
  people_and_organizations: 'Characters and organizations connected to this location.',
}

export const LOCATION_CONNECTED_PARTIES_EMPTY_TEXT: Record<
  LocationConnectedPartySectionGroup,
  string
> = {
  territorial_authority: TERRITORIAL_AUTHORITY_SECTION_EMPTY,
  people_and_organizations: 'No people or organizations linked.',
}

export const LOCATION_PEOPLE_SECTION_SURFACE_COPY = {
  add: 'Add relationship',
  addDrawerTitle: 'Add relationship',
  kindFieldLabel: 'Relationship type',
  chooseKindMessage: 'Choose a relationship type to see eligible people and organizations.',
} as const
