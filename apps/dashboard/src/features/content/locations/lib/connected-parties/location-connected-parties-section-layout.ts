import type { LocationConnectedPartySectionGroup } from '@rpg/contracts'

export const TERRITORIAL_AUTHORITY_HEADING_ID =
  'location-connected-parties-territorial_authority-heading' as const

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
