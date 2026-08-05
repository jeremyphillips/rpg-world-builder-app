import type {
  CharacterLocationConnectionKind,
  Location,
  LocationConnectedPartyRow,
  OrganizationLocationConnectionFamily,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  getOrganizationLocationConnectionFamily,
  resolveLocationConnectionEligibility,
} from '@rpg/contracts'

import { toLocationConnectionEligibilityInput } from './location-connection-eligibility-input'
import {
  buildOrganizationLocationConnectionKeySet,
  buildSubjectLocationConnectionKeySet,
  organizationLocationConnectionKey,
  subjectLocationConnectionKey,
} from './location-connection-duplicate-keys'

export type OrganizationConnectionDrawerIntent =
  | 'site'
  | 'geographic_presence'
  | 'territorial_authority'

export type CharacterConnectionDrawerIntent = 'character'

export type LocationConnectionDrawerIntent =
  | OrganizationConnectionDrawerIntent
  | CharacterConnectionDrawerIntent

export type LocationInverseOrganizationAddAffordance = {
  intent: OrganizationConnectionDrawerIntent
  label: string
}

export const ORGANIZATION_FORWARD_CONNECTION_MENU_ITEMS: ReadonlyArray<{
  intent: OrganizationConnectionDrawerIntent
  label: string
}> = [
  { intent: 'site', label: 'Site relationship' },
  { intent: 'geographic_presence', label: 'Geographic presence' },
  { intent: 'territorial_authority', label: 'Territorial authority' },
]

export const LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON = 'Already linked'

export const ORGANIZATION_DRAWER_FULLY_LINKED_REASONS: Record<
  OrganizationConnectionDrawerIntent,
  string
> = {
  territorial_authority: 'All authority types already linked.',
  geographic_presence: 'Organization presence already linked.',
  site: 'All site relationship types already linked.',
}

export const CHARACTER_DRAWER_FULLY_LINKED_REASON = 'All connection types already linked.'

export const ORGANIZATION_DRAWER_KIND_FIELD_LABELS: Record<
  OrganizationConnectionDrawerIntent,
  string
> = {
  territorial_authority: 'Authority type',
  geographic_presence: 'Connection type',
  site: 'Connection type',
}

export const ORGANIZATION_DRAWER_ADD_TITLES: Record<OrganizationConnectionDrawerIntent, string> = {
  site: 'Add site relationship',
  geographic_presence: 'Add geographic presence',
  territorial_authority: 'Add territorial authority',
}

export const ORGANIZATION_DRAWER_EDIT_TITLES: Record<OrganizationConnectionDrawerIntent, string> = {
  site: 'Edit site relationship',
  geographic_presence: 'Edit organization presence',
  territorial_authority: 'Edit territorial authority',
}

export const ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS: Record<
  OrganizationConnectionDrawerIntent,
  string
> = {
  site: 'Add site relationship',
  geographic_presence: 'Add geographic presence',
  territorial_authority: 'Add territorial authority',
}

export const LOCATION_INVERSE_ORGANIZATION_DRAWER_ADD_TITLES: Partial<
  Record<OrganizationConnectionDrawerIntent, string>
> & {
  territorial_authority_settlement: string
} = {
  territorial_authority: 'Add territorial authority',
  territorial_authority_settlement: 'Add governing organization',
  geographic_presence: 'Add organization presence',
  site: 'Add site relationship',
}

export function organizationDrawerIntentFromKind(
  kind: OrganizationLocationConnectionKind,
): OrganizationConnectionDrawerIntent {
  return getOrganizationLocationConnectionFamily(kind)
}

export function filterOrganizationKindsByFamily(
  kinds: readonly OrganizationLocationConnectionKind[],
  family: OrganizationLocationConnectionFamily,
): OrganizationLocationConnectionKind[] {
  return kinds.filter((kind) => getOrganizationLocationConnectionFamily(kind) === family)
}

export function resolveOrganizationKindsForDrawerIntent(
  location: Location,
  intent: OrganizationConnectionDrawerIntent,
): OrganizationLocationConnectionKind[] {
  const eligibility = resolveLocationConnectionEligibility(
    toLocationConnectionEligibilityInput(location),
  )
  return filterOrganizationKindsByFamily(eligibility.organizationKinds, intent)
}

export function locationEligibleForOrganizationDrawerIntent(
  location: Location,
  intent: OrganizationConnectionDrawerIntent,
): boolean {
  return resolveOrganizationKindsForDrawerIntent(location, intent).length > 0
}

export function organizationForwardLocationHasAvailableKind(
  location: Location,
  intent: OrganizationConnectionDrawerIntent,
  existingKeys: ReadonlySet<string>,
): boolean {
  const kinds = resolveOrganizationKindsForDrawerIntent(location, intent)
  return kinds.some(
    (kind) => !existingKeys.has(organizationLocationConnectionKey(location.id, kind)),
  )
}

export function organizationInverseSubjectHasAvailableKind(
  subjectId: string,
  eligibleKinds: readonly OrganizationLocationConnectionKind[],
  existingKeys: ReadonlySet<string>,
): boolean {
  return eligibleKinds.some(
    (kind) => !existingKeys.has(subjectLocationConnectionKey(subjectId, kind)),
  )
}

export function characterInverseSubjectHasAvailableKind(
  subjectId: string,
  eligibleKinds: readonly CharacterLocationConnectionKind[],
  existingKeys: ReadonlySet<string>,
): boolean {
  return eligibleKinds.some(
    (kind) => !existingKeys.has(subjectLocationConnectionKey(subjectId, kind)),
  )
}

export function resolveLocationInverseOrganizationAddAffordances(
  location: Location,
): LocationInverseOrganizationAddAffordance[] {
  const profile = toLocationConnectionEligibilityInput(location)
  const eligibility = resolveLocationConnectionEligibility(profile)
  const affordances: LocationInverseOrganizationAddAffordance[] = []

  const territorialKinds = filterOrganizationKindsByFamily(
    eligibility.organizationKinds,
    'territorial_authority',
  )
  if (territorialKinds.length > 0) {
    affordances.push({
      intent: 'territorial_authority',
      label: profile.kind === 'settlement' ? 'Add governing organization' : 'Add authority',
    })
  }

  const siteKinds = filterOrganizationKindsByFamily(eligibility.organizationKinds, 'site')
  if (siteKinds.length > 0) {
    affordances.push({
      intent: 'site',
      label: profile.kind === 'settlement' ? 'Add headquarters' : 'Add site relationship',
    })
  }

  const presenceKinds = filterOrganizationKindsByFamily(
    eligibility.organizationKinds,
    'geographic_presence',
  )
  if (presenceKinds.length > 0) {
    affordances.push({
      intent: 'geographic_presence',
      label: 'Add organization presence',
    })
  }

  return affordances
}

export function resolveTerritorialSectionOrganizationAddAffordances(
  location: Location,
): LocationInverseOrganizationAddAffordance[] {
  return resolveLocationInverseOrganizationAddAffordances(location).filter(
    (affordance) => affordance.intent === 'territorial_authority',
  )
}

export function resolvePeopleSectionOrganizationAddAffordances(
  location: Location,
): LocationInverseOrganizationAddAffordance[] {
  return resolveLocationInverseOrganizationAddAffordances(location).filter(
    (affordance) => affordance.intent !== 'territorial_authority',
  )
}

export function resolveLocationInverseOrganizationAddTitle(
  intent: OrganizationConnectionDrawerIntent,
  location: Location,
): string {
  if (intent === 'territorial_authority' && location.kind === 'settlement') {
    return LOCATION_INVERSE_ORGANIZATION_DRAWER_ADD_TITLES.territorial_authority_settlement
  }
  return (
    LOCATION_INVERSE_ORGANIZATION_DRAWER_ADD_TITLES[intent] ??
    ORGANIZATION_DRAWER_ADD_TITLES[intent]
  )
}

export function buildOrganizationForwardExistingKeys(
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>,
  excludeConnectionId?: string,
): Set<string> {
  return buildOrganizationLocationConnectionKeySet(connections, excludeConnectionId)
}

export function buildOrganizationInverseExistingKeys(
  rows: readonly LocationConnectedPartyRow[],
  excludeRelationshipId?: string,
): Set<string> {
  return buildSubjectLocationConnectionKeySet(
    rows.filter((row) => row.subject.type === 'organization'),
    excludeRelationshipId,
  )
}

export function buildCharacterInverseExistingKeys(
  rows: readonly LocationConnectedPartyRow[],
  excludeRelationshipId?: string,
): Set<string> {
  return buildSubjectLocationConnectionKeySet(
    rows.filter((row) => row.subject.type === 'character'),
    excludeRelationshipId,
  )
}

export function filterLocationsForOrganizationDrawerIntent(
  locations: readonly Location[],
  intent: OrganizationConnectionDrawerIntent,
  existingKeys: ReadonlySet<string>,
): Location[] {
  return locations.filter(
    (location) =>
      locationEligibleForOrganizationDrawerIntent(location, intent) &&
      organizationForwardLocationHasAvailableKind(location, intent, existingKeys),
  )
}
