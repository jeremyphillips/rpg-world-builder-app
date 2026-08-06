import type { LocationConnectedPartySectionGroup } from '@rpg/contracts'

import { TERRITORIAL_AUTHORITY_HEADING_ID } from '../components/location-territorial-authority-section.client'

export function usesFieldGroupHeader(sectionGroup: LocationConnectedPartySectionGroup): boolean {
  return sectionGroup === 'territorial_authority' || sectionGroup === 'people_and_organizations'
}

export function resolveLocationConnectedPartiesSectionHeadingId(
  sectionGroup: LocationConnectedPartySectionGroup,
): string {
  return sectionGroup === 'territorial_authority'
    ? TERRITORIAL_AUTHORITY_HEADING_ID
    : `location-connected-parties-${sectionGroup}-heading`
}
