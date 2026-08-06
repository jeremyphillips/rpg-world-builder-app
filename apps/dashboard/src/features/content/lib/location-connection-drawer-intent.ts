import type {
  CharacterLocationConnectionKind,
  Location,
  LocationConnectedPartyRow,
  OrganizationLocationConnectionEdgeAtLocation,
  OrganizationLocationConnectionFamily,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  getOrganizationLocationConnectionFamily,
  getOrganizationLocationConnectionMaxSubjectsPerLocation,
  ORGANIZATION_LOCATION_CONNECTION_ENTRIES,
  resolveLocationConnectionEligibility,
} from '@rpg/contracts'

import { toLocationConnectionEligibilityInput } from './location-connection-eligibility-input'
import {
  buildOrganizationInverseLocationConnections,
  buildOrganizationLocationConnectionEdgesAtLocation,
  buildOrganizationLocationConnectionKeySet,
  buildSubjectLocationConnectionKeySet,
  organizationLocationConnectionHasAvailableKind,
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

export const LOCATION_CONNECTION_KIND_CHANGE_LABEL = 'Change connection type'

export const ORGANIZATION_DRAWER_CHANGE_KIND_TITLE = 'Change connection type'

export const ORGANIZATION_DRAWER_CHANGE_KIND_SUBMIT_LABEL = 'Save change'

export const LOCATION_INVERSE_CHARACTER_CHANGE_KIND_TITLE = 'Change connection type'

export const LOCATION_INVERSE_CHARACTER_CHANGE_KIND_SUBMIT_LABEL = 'Save change'

export const ORGANIZATION_DRAWER_FULLY_LINKED_REASONS: Record<
  OrganizationConnectionDrawerIntent,
  string
> = {
  territorial_authority: 'Territorial authority already linked.',
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
  site: 'Relationship type',
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

export function resolveKindsForOrganizationDrawerIntent(
  intent: OrganizationConnectionDrawerIntent,
): OrganizationLocationConnectionKind[] {
  return (
    Object.entries(ORGANIZATION_LOCATION_CONNECTION_ENTRIES) as [
      OrganizationLocationConnectionKind,
      (typeof ORGANIZATION_LOCATION_CONNECTION_ENTRIES)[OrganizationLocationConnectionKind],
    ][]
  )
    .filter(([, entry]) => entry.family === intent)
    .sort((a, b) => b[1].priority - a[1].priority)
    .map(([kind]) => kind)
}

export function resolveEdgesAtLocation(
  locationId: string,
  edgesByLocationId?: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >,
): readonly OrganizationLocationConnectionEdgeAtLocation[] | undefined {
  if (!edgesByLocationId) {
    return undefined
  }
  return edgesByLocationId[locationId]
}

export function locationEligibleForOrganizationKind(
  location: Location,
  kind: OrganizationLocationConnectionKind,
  subjectOrganizationId: string,
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>,
  edgesByLocationId?: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >,
  excludeConnectionId?: string,
): boolean {
  const intent = organizationDrawerIntentFromKind(kind)
  if (!resolveOrganizationKindsForDrawerIntent(location, intent).includes(kind)) {
    return false
  }

  const edgesAtLocation = resolveEdgesAtLocation(location.id, edgesByLocationId)

  return organizationLocationConnectionHasAvailableKind({
    locationId: location.id,
    kinds: [kind],
    subjectOrganizationId,
    connections,
    edgesAtLocation,
    excludeConnectionId,
  })
}

export function filterLocationsForOrganizationKind(
  locations: readonly Location[],
  kind: OrganizationLocationConnectionKind,
  subjectOrganizationId: string,
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>,
  edgesByLocationId?: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >,
  excludeConnectionId?: string,
): Location[] {
  return locations.filter((location) =>
    locationEligibleForOrganizationKind(
      location,
      kind,
      subjectOrganizationId,
      connections,
      edgesByLocationId,
      excludeConnectionId,
    ),
  )
}

export function organizationForwardKindHasAvailableLocation(
  kind: OrganizationLocationConnectionKind,
  locations: readonly Location[],
  subjectOrganizationId: string,
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>,
  edgesByLocationId?: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >,
  excludeConnectionId?: string,
  occupancyLoaded = true,
): boolean {
  const maxSubjects = getOrganizationLocationConnectionMaxSubjectsPerLocation(kind)
  if (maxSubjects === 1 && !occupancyLoaded) {
    return locations.some((location) => {
      const intent = organizationDrawerIntentFromKind(kind)
      return resolveOrganizationKindsForDrawerIntent(location, intent).includes(kind)
    })
  }

  return locations.some((location) =>
    locationEligibleForOrganizationKind(
      location,
      kind,
      subjectOrganizationId,
      connections,
      edgesByLocationId,
      excludeConnectionId,
    ),
  )
}

export function organizationForwardFamilyHasAvailableTarget(
  intent: OrganizationConnectionDrawerIntent,
  locations: readonly Location[],
  subjectOrganizationId: string,
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>,
  edgesByLocationId?: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >,
  excludeConnectionId?: string,
  occupancyLoaded = true,
): boolean {
  return resolveKindsForOrganizationDrawerIntent(intent).some((kind) =>
    organizationForwardKindHasAvailableLocation(
      kind,
      locations,
      subjectOrganizationId,
      connections,
      edgesByLocationId,
      excludeConnectionId,
      occupancyLoaded,
    ),
  )
}

export function organizationConnectionDrawerIntentFromFamily(
  family: OrganizationLocationConnectionFamily,
): OrganizationConnectionDrawerIntent {
  return family
}

export function resolveVisibleOrganizationConnectionFamilies(
  locations: readonly Location[],
): OrganizationLocationConnectionFamily[] {
  const families: OrganizationLocationConnectionFamily[] = []
  for (const intent of ['territorial_authority', 'geographic_presence', 'site'] as const) {
    if (
      locations.some((location) => locationEligibleForOrganizationDrawerIntent(location, intent))
    ) {
      families.push(intent)
    }
  }
  return families
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
  subjectOrganizationId: string,
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>,
  edgesAtLocation?: readonly OrganizationLocationConnectionEdgeAtLocation[],
  excludeConnectionId?: string,
): boolean {
  const kinds = resolveOrganizationKindsForDrawerIntent(location, intent)
  return organizationLocationConnectionHasAvailableKind({
    locationId: location.id,
    kinds,
    subjectOrganizationId,
    connections,
    edgesAtLocation,
    excludeConnectionId,
  })
}

export function organizationInverseSubjectHasAvailableKind(
  subjectId: string,
  locationId: string,
  eligibleKinds: readonly OrganizationLocationConnectionKind[],
  rows: ReadonlyArray<{
    subject: { id: string; type?: string }
    kind: string
    relationshipId?: string
  }>,
  excludeRelationshipId?: string,
): boolean {
  const connections = buildOrganizationInverseLocationConnections(
    rows,
    locationId,
    subjectId,
    excludeRelationshipId,
  )
  const edgesAtLocation = buildOrganizationLocationConnectionEdgesAtLocation(
    rows
      .filter((row): row is typeof row & { relationshipId: string } => Boolean(row.relationshipId))
      .map((row) => ({
        subject: { id: row.subject.id, type: row.subject.type ?? 'organization' },
        kind: row.kind,
        relationshipId: row.relationshipId,
      })),
    locationId,
  )

  return organizationLocationConnectionHasAvailableKind({
    locationId,
    kinds: eligibleKinds,
    subjectOrganizationId: subjectId,
    connections,
    edgesAtLocation,
  })
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
  subjectOrganizationId: string,
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>,
  edgesAtLocation?: readonly OrganizationLocationConnectionEdgeAtLocation[],
  excludeConnectionId?: string,
): Location[] {
  return locations.filter(
    (location) =>
      locationEligibleForOrganizationDrawerIntent(location, intent) &&
      organizationForwardLocationHasAvailableKind(
        location,
        intent,
        subjectOrganizationId,
        connections,
        edgesAtLocation,
        excludeConnectionId,
      ),
  )
}
