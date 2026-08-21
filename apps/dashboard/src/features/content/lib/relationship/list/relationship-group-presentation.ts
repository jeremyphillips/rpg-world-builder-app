import type { LocationConnectedPartySectionGroup } from '@rpg/contracts'
import type { OrganizationLocationConnectionFamily } from '@rpg/contracts'

export type RelationshipGroupPresentation = 'meaningful_slots' | 'sparse_groups'

export type LocationConnectedPartyRelationshipPresentationKey = LocationConnectedPartySectionGroup

export type OrganizationLocationConnectionFamilyPresentationKey =
  OrganizationLocationConnectionFamily

export const LOCATION_CONNECTED_PARTY_RELATIONSHIP_PRESENTATION: Record<
  LocationConnectedPartyRelationshipPresentationKey,
  RelationshipGroupPresentation
> = {
  territorial_authority: 'meaningful_slots',
  people_and_organizations: 'sparse_groups',
}

export const ORGANIZATION_LOCATION_CONNECTION_FAMILY_PRESENTATION: Record<
  OrganizationLocationConnectionFamilyPresentationKey,
  RelationshipGroupPresentation
> = {
  site: 'sparse_groups',
  geographic_presence: 'sparse_groups',
  territorial_authority: 'sparse_groups',
}

export function resolveLocationConnectedPartyRelationshipPresentation(
  sectionGroup: LocationConnectedPartySectionGroup,
): RelationshipGroupPresentation {
  return LOCATION_CONNECTED_PARTY_RELATIONSHIP_PRESENTATION[sectionGroup]
}

export function resolveOrganizationLocationConnectionFamilyPresentation(
  family: OrganizationLocationConnectionFamily,
): RelationshipGroupPresentation {
  return ORGANIZATION_LOCATION_CONNECTION_FAMILY_PRESENTATION[family]
}

/** Labeled structural groups: empty slots use `RelationshipList.Group` `headerAction`. */
export function relationshipGroupUsesLabeledSlotActions(
  presentation: RelationshipGroupPresentation,
): boolean {
  return presentation === 'meaningful_slots'
}

/** Family-level add and section empty copy live on `RelationshipList.Root`. */
export function relationshipGroupUsesRootFamilyAdd(
  presentation: RelationshipGroupPresentation,
): boolean {
  return presentation === 'sparse_groups'
}
