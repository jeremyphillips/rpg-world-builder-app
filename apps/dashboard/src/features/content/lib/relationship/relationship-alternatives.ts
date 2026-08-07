import type {
  CharacterLocationConnectionKind,
  Location,
  LocationConnectedPartyRow,
  OrganizationLocationConnectionEdgeAtLocation,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  getOrganizationLocationConnectionMaxSubjectsPerLocation,
  resolveLocationConnectionEligibility,
} from '@rpg/contracts'

import {
  buildOrganizationInverseLocationConnections,
  buildOrganizationLocationConnectionEdgesAtLocation,
  buildSubjectLocationConnectionKeySet,
  isOrganizationLocationConnectionKindBlockedForLocation,
  subjectLocationConnectionKey,
} from '../location-connection-duplicate-keys'
import { toLocationConnectionEligibilityInput } from '../location-connection-eligibility-input'
import {
  filterLocationsForOrganizationKind,
  organizationDrawerIntentFromKind,
  organizationInverseSubjectHasAvailableKind,
  resolveEdgesAtLocation,
  resolveKindsForOrganizationDrawerIntent,
  resolveOrganizationKindsForDrawerIntent,
} from '../location-connection-drawer-intent'
import {
  buildCharacterLocationConnectionKindOptions,
  buildOrganizationLocationConnectionKindOptions,
  type LocationConnectionKindOption,
} from '../location-connection-kind-options'
import {
  availabilityFromStructuralCount,
  resolveCatalogMutationAvailability,
  resolveRelationshipCandidateSet,
  type RelationshipCandidateSet,
} from './relationship-candidate-set'

export type { RelationshipCandidateSet } from './relationship-candidate-set'

export type AvailabilityState = 'available' | 'unavailable' | 'unknown'

export type RelationshipOperationState = {
  /** Mutation category applies on this surface (authz + endpoint mutability). */
  supported: boolean
  /** Whether >= 1 valid alternative exists. `unknown` while prerequisite data is loading. */
  availability: AvailabilityState
  /** Transient authoritative data still loading. Only meaningful when availability === 'unknown'. */
  isResolving?: boolean
}

export type RelationshipMutationCapabilities = {
  view?: RelationshipOperationState
  changeKind?: RelationshipOperationState
  changeTarget?: RelationshipOperationState
  replaceSubject?: RelationshipOperationState
  remove?: RelationshipOperationState
}

export type RelationshipAvailabilitySnapshot = {
  alternateKinds?: readonly OrganizationLocationConnectionKind[]
  alternateTargets?: readonly { id: string }[]
  alternateSubjects?: readonly { id: string; type: 'organization' | 'character' }[]
}

export type OrganizationForwardRelationshipSnapshot = {
  connectionId: string
  locationId: string
  kind: OrganizationLocationConnectionKind
  subjectOrganizationId: string
}

export type LocationInverseOrganizationRelationshipSnapshot = {
  relationshipId: string
  locationId: string
  kind: OrganizationLocationConnectionKind
  subjectOrganizationId: string
  allowReplaceSubject?: boolean
}

export type LocationInverseCharacterRelationshipSnapshot = {
  relationshipId: string
  locationId: string
  kind: CharacterLocationConnectionKind
  subjectCharacterId: string
}

export type RelationshipAlternativesInput =
  | OrganizationForwardRelationshipAlternativesInput
  | LocationInverseOrganizationRelationshipAlternativesInput
  | LocationInverseCharacterRelationshipAlternativesInput

type SharedAlternativesInput = {
  canManage: boolean
  canEditRow?: boolean
  canRemoveRow?: boolean
  occupancyLoaded?: boolean
  availabilitySnapshot?: RelationshipAvailabilitySnapshot
}

export type OrganizationForwardRelationshipAlternativesInput = SharedAlternativesInput & {
  surface: 'organization_forward'
  relationship: OrganizationForwardRelationshipSnapshot
  locationCandidates?: RelationshipCandidateSet<Location>
  connections?: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>
  edgesByLocationId?: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >
}

export type LocationInverseOrganizationRelationshipAlternativesInput = SharedAlternativesInput & {
  surface: 'location_inverse_organization'
  relationship: LocationInverseOrganizationRelationshipSnapshot
  location: Location
  rows?: readonly LocationConnectedPartyRow[]
  organizationCandidates?: RelationshipCandidateSet<{ id: string; name: string }>
}

export type LocationInverseCharacterRelationshipAlternativesInput = SharedAlternativesInput & {
  surface: 'location_inverse_character'
  relationship: LocationInverseCharacterRelationshipSnapshot
  location: Location
  rows?: readonly LocationConnectedPartyRow[]
}

export type RelationshipAlternatives = {
  capabilities: RelationshipMutationCapabilities
  alternatives: {
    changeKind?: LocationConnectionKindOption[]
    changeTarget?: Location[]
    replaceSubject?: Array<{ id: string; name: string; type: 'organization' | 'character' }>
  }
}

export const RELATIONSHIP_ALTERNATIVES_EMPTY_MESSAGES = {
  changeKind: 'No alternative connection types are currently available.',
  changeTarget: 'No alternative locations are currently available.',
  replaceSubject: 'No alternative organizations are currently available.',
} as const

function supportedOnly(supported: boolean): RelationshipOperationState {
  return { supported, availability: supported ? 'available' : 'unavailable' }
}

function kindRequiresOccupancyData(kind: OrganizationLocationConnectionKind): boolean {
  return getOrganizationLocationConnectionMaxSubjectsPerLocation(kind) === 1
}

function alternateKindsRequireOccupancyData(
  kinds: readonly OrganizationLocationConnectionKind[],
): boolean {
  return kinds.some((kind) => kindRequiresOccupancyData(kind))
}

function resolveAlternateOrganizationKindsAtLocation(input: {
  location: Location
  currentKind: OrganizationLocationConnectionKind
  subjectOrganizationId: string
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>
  edgesAtLocation?: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
}): OrganizationLocationConnectionKind[] {
  const intent = organizationDrawerIntentFromKind(input.currentKind)
  const profileKinds = resolveOrganizationKindsForDrawerIntent(input.location, intent)

  return profileKinds
    .filter((kind) => kind !== input.currentKind)
    .filter(
      (kind) =>
        !isOrganizationLocationConnectionKindBlockedForLocation({
          locationId: input.location.id,
          kind,
          subjectOrganizationId: input.subjectOrganizationId,
          connections: input.connections,
          edgesAtLocation: input.edgesAtLocation,
          excludeConnectionId: input.excludeConnectionId,
        }),
    )
}

function buildEnabledKindOptions(
  locationId: string,
  kinds: readonly OrganizationLocationConnectionKind[],
  subjectOrganizationId: string,
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>,
  edgesAtLocation?: readonly OrganizationLocationConnectionEdgeAtLocation[],
  excludeConnectionId?: string,
): LocationConnectionKindOption[] {
  return buildOrganizationLocationConnectionKindOptions({
    locationId,
    kinds,
    subjectOrganizationId,
    connections,
    edgesAtLocation,
    excludeConnectionId,
  }).filter((option) => !option.disabled)
}

// fallow-ignore-next-line complexity
function resolveOrganizationForwardAlternatives(
  input: OrganizationForwardRelationshipAlternativesInput,
): RelationshipAlternatives {
  const { relationship, canManage, occupancyLoaded = true } = input
  const locationCandidates = resolveRelationshipCandidateSet(input.locationCandidates)
  const locations = locationCandidates.items
  const connections = input.connections ?? []
  const currentLocation =
    locations.find((location) => location.id === relationship.locationId) ?? null

  const view = supportedOnly(true)
  const remove = supportedOnly(canManage)

  if (input.availabilitySnapshot) {
    const snapshot = input.availabilitySnapshot
    const alternateKinds = snapshot.alternateKinds ?? []
    const alternateTargetIds = new Set((snapshot.alternateTargets ?? []).map((target) => target.id))
    const alternateTargets = locations.filter(
      (location) => alternateTargetIds.has(location.id) && location.id !== relationship.locationId,
    )

    return {
      capabilities: {
        view,
        remove,
        changeKind: availabilityFromStructuralCount(canManage, alternateKinds.length, false),
        changeTarget: availabilityFromStructuralCount(canManage, alternateTargets.length, false),
      },
      alternatives: {
        changeKind: alternateKinds.map((kind) => ({
          value: kind,
          label: kind,
          description: '',
        })),
        changeTarget: alternateTargets,
      },
    }
  }

  const edgesAtLocation = resolveEdgesAtLocation(relationship.locationId, input.edgesByLocationId)

  let changeKindAlternates: OrganizationLocationConnectionKind[] = []
  const changeKindPrerequisiteUnknown =
    currentLocation != null &&
    canManage &&
    !occupancyLoaded &&
    alternateKindsRequireOccupancyData([
      relationship.kind,
      ...resolveKindsForOrganizationDrawerIntent(
        organizationDrawerIntentFromKind(relationship.kind),
      ),
    ])

  if (currentLocation && canManage && !changeKindPrerequisiteUnknown) {
    changeKindAlternates = resolveAlternateOrganizationKindsAtLocation({
      location: currentLocation,
      currentKind: relationship.kind,
      subjectOrganizationId: relationship.subjectOrganizationId,
      connections,
      edgesAtLocation,
      excludeConnectionId: relationship.connectionId,
    })
  }

  const changeTargetPrerequisiteUnknown =
    canManage && !occupancyLoaded && kindRequiresOccupancyData(relationship.kind)

  const changeTargetLocations =
    canManage && !changeTargetPrerequisiteUnknown
      ? filterLocationsForOrganizationKind(
          locations,
          relationship.kind,
          relationship.subjectOrganizationId,
          connections,
          input.edgesByLocationId,
          relationship.connectionId,
        ).filter((location) => location.id !== relationship.locationId)
      : []

  const changeKindOptions =
    currentLocation && changeKindAlternates.length > 0
      ? buildEnabledKindOptions(
          currentLocation.id,
          changeKindAlternates,
          relationship.subjectOrganizationId,
          connections,
          edgesAtLocation,
          relationship.connectionId,
        )
      : []

  return {
    capabilities: {
      view,
      remove,
      changeKind: availabilityFromStructuralCount(
        canManage,
        changeKindOptions.length,
        changeKindPrerequisiteUnknown,
      ),
      changeTarget: resolveCatalogMutationAvailability({
        supported: canManage,
        matchCount: changeTargetLocations.length,
        isAuthoritativeDomainSet: locationCandidates.isAuthoritativeDomainSet,
        prerequisiteUnknown: changeTargetPrerequisiteUnknown,
      }),
    },
    alternatives: {
      changeKind: changeKindOptions.length > 0 ? changeKindOptions : undefined,
      changeTarget: changeTargetLocations.length > 0 ? changeTargetLocations : undefined,
    },
  }
}

// fallow-ignore-next-line complexity
function resolveLocationInverseOrganizationAlternatives(
  input: LocationInverseOrganizationRelationshipAlternativesInput,
): RelationshipAlternatives {
  const canEdit = Boolean(input.canEditRow ?? input.canManage)
  const canRemove = Boolean(input.canRemoveRow ?? input.canManage)
  const rows = input.rows ?? []
  const organizationCandidates = resolveRelationshipCandidateSet(input.organizationCandidates)
  const organizations = organizationCandidates.items
  const { relationship, location } = input

  const view = supportedOnly(true)
  const remove = supportedOnly(canRemove)

  if (input.availabilitySnapshot) {
    const snapshot = input.availabilitySnapshot
    const alternateKinds = snapshot.alternateKinds ?? []
    const alternateSubjectIds = new Set(
      (snapshot.alternateSubjects ?? [])
        .filter((subject) => subject.type === 'organization')
        .map((subject) => subject.id),
    )
    const alternateSubjects = organizations
      .filter(
        (organization) =>
          alternateSubjectIds.has(organization.id) &&
          organization.id !== relationship.subjectOrganizationId,
      )
      .map((organization) => ({
        id: organization.id,
        name: organization.name,
        type: 'organization' as const,
      }))

    return {
      capabilities: {
        view,
        remove,
        changeKind: availabilityFromStructuralCount(canEdit, alternateKinds.length, false),
        changeTarget: { supported: false, availability: 'unavailable' },
        replaceSubject: availabilityFromStructuralCount(
          canEdit && Boolean(relationship.allowReplaceSubject),
          alternateSubjects.length,
          false,
        ),
      },
      alternatives: {
        changeKind: alternateKinds.map((kind) => ({
          value: kind,
          label: kind,
          description: '',
        })),
        replaceSubject: alternateSubjects.length > 0 ? alternateSubjects : undefined,
      },
    }
  }

  const intent = organizationDrawerIntentFromKind(relationship.kind)
  const eligibleKinds = resolveOrganizationKindsForDrawerIntent(location, intent)
  const alternateKinds = eligibleKinds
    .filter((kind) => kind !== relationship.kind)
    .filter((kind) =>
      organizationInverseSubjectHasAvailableKind(
        relationship.subjectOrganizationId,
        relationship.locationId,
        [kind],
        rows,
        relationship.relationshipId,
      ),
    )

  const edgesAtLocation = buildOrganizationLocationConnectionEdgesAtLocation(
    rows
      .filter((row): row is typeof row & { relationshipId: string } => Boolean(row.relationshipId))
      .map((row) => ({
        subject: { id: row.subject.id, type: row.subject.type },
        kind: row.kind,
        relationshipId: row.relationshipId,
      })),
    relationship.locationId,
  )

  const inverseConnections = buildOrganizationInverseLocationConnections(
    rows,
    relationship.locationId,
    relationship.subjectOrganizationId,
    relationship.relationshipId,
  )

  const changeKindOptions =
    alternateKinds.length > 0
      ? buildEnabledKindOptions(
          relationship.locationId,
          alternateKinds,
          relationship.subjectOrganizationId,
          inverseConnections,
          edgesAtLocation,
          relationship.relationshipId,
        )
      : []

  const replaceSubjectSupported = canEdit && Boolean(relationship.allowReplaceSubject)
  const alternateSubjects = replaceSubjectSupported
    ? organizations
        .filter((organization) => organization.id !== relationship.subjectOrganizationId)
        .filter((organization) =>
          organizationInverseSubjectHasAvailableKind(
            organization.id,
            relationship.locationId,
            [relationship.kind],
            rows,
            relationship.relationshipId,
          ),
        )
        .map((organization) => ({
          id: organization.id,
          name: organization.name,
          type: 'organization' as const,
        }))
    : []

  return {
    capabilities: {
      view,
      remove,
      changeKind: availabilityFromStructuralCount(canEdit, changeKindOptions.length, false),
      changeTarget: { supported: false, availability: 'unavailable' },
      replaceSubject: resolveCatalogMutationAvailability({
        supported: replaceSubjectSupported,
        matchCount: alternateSubjects.length,
        isAuthoritativeDomainSet: organizationCandidates.isAuthoritativeDomainSet,
      }),
    },
    alternatives: {
      changeKind: changeKindOptions.length > 0 ? changeKindOptions : undefined,
      replaceSubject: alternateSubjects.length > 0 ? alternateSubjects : undefined,
    },
  }
}

function resolveLocationInverseCharacterAlternatives(
  input: LocationInverseCharacterRelationshipAlternativesInput,
): RelationshipAlternatives {
  const canEdit = Boolean(input.canEditRow ?? input.canManage)
  const canRemove = Boolean(input.canRemoveRow ?? input.canManage)
  const rows = input.rows ?? []
  const { relationship, location } = input

  const view = supportedOnly(true)
  const remove = supportedOnly(canRemove)

  const eligibility = resolveLocationConnectionEligibility(
    toLocationConnectionEligibilityInput(location),
  )
  const characterRows = rows.filter((row) => row.subject.type === 'character')
  const existingKeys = buildSubjectLocationConnectionKeySet(
    characterRows,
    relationship.relationshipId,
  )

  const alternateKinds = eligibility.characterKinds
    .filter((kind) => kind !== relationship.kind)
    .filter(
      (kind) =>
        !existingKeys.has(subjectLocationConnectionKey(relationship.subjectCharacterId, kind)),
    )

  const changeKindOptions =
    alternateKinds.length > 0
      ? buildCharacterLocationConnectionKindOptions(alternateKinds).filter(
          (option) => !option.disabled,
        )
      : []

  return {
    capabilities: {
      view,
      remove,
      changeKind: availabilityFromStructuralCount(canEdit, changeKindOptions.length, false),
      changeTarget: { supported: false, availability: 'unavailable' },
      replaceSubject: { supported: false, availability: 'unavailable' },
    },
    alternatives: {
      changeKind: changeKindOptions.length > 0 ? changeKindOptions : undefined,
    },
  }
}

export function resolveRelationshipAlternatives(
  input: RelationshipAlternativesInput,
): RelationshipAlternatives {
  switch (input.surface) {
    case 'organization_forward':
      return resolveOrganizationForwardAlternatives(input)
    case 'location_inverse_organization':
      return resolveLocationInverseOrganizationAlternatives(input)
    case 'location_inverse_character':
      return resolveLocationInverseCharacterAlternatives(input)
  }
}

/** User may see or invoke the mutation — not authoritatively negative. */
export function isRelationshipMutationActionVisible(
  capabilities: RelationshipMutationCapabilities,
  actionId: 'changeKind' | 'changeTarget' | 'replaceSubject',
): boolean {
  const operation = capabilities[actionId]
  return Boolean(operation?.supported && operation.availability !== 'unavailable')
}

/** Materialized alternatives exist — does not govern invocation visibility. */
export function hasResolvedRelationshipMutationAlternative(
  capabilities: RelationshipMutationCapabilities,
  actionId: 'changeKind' | 'changeTarget' | 'replaceSubject',
): boolean {
  const operation = capabilities[actionId]
  return Boolean(operation?.supported && operation.availability === 'available')
}

/** @deprecated Use {@link hasResolvedRelationshipMutationAlternative} or {@link isRelationshipMutationActionVisible}. */
export const isRelationshipMutationActionAvailable = hasResolvedRelationshipMutationAlternative

export function assertRelationshipAlternativesMatchCapabilities(
  capabilities: RelationshipMutationCapabilities,
  alternatives: RelationshipAlternatives['alternatives'],
): void {
  if (hasResolvedRelationshipMutationAlternative(capabilities, 'changeKind')) {
    if (!alternatives.changeKind?.length) {
      throw new Error('changeKind is available but alternatives.changeKind is empty')
    }
  }

  if (hasResolvedRelationshipMutationAlternative(capabilities, 'changeTarget')) {
    if (!alternatives.changeTarget?.length) {
      throw new Error('changeTarget is available but alternatives.changeTarget is empty')
    }
  }

  if (hasResolvedRelationshipMutationAlternative(capabilities, 'replaceSubject')) {
    if (!alternatives.replaceSubject?.length) {
      throw new Error('replaceSubject is available but alternatives.replaceSubject is empty')
    }
  }
}
