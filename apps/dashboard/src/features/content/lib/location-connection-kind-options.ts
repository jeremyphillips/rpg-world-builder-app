import type {
  CharacterLocationConnectionKind,
  Location,
  OrganizationLocationConnectionEdgeAtLocation,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  CHARACTER_LOCATION_CONNECTION_ENTRIES,
  getCharacterLocationConnectionLabel,
  getOrganizationLocationConnectionLabel,
  ORGANIZATION_LOCATION_CONNECTION_ENTRIES,
  organizationLocationConnectionKindBlockedForOrganizationAtLocation,
  resolveOrganizationLocationConnectionLocationOccupant,
} from '@rpg/contracts'

import { isOrganizationLocationConnectionKindBlockedForLocation } from './location-connection-duplicate-keys'
import {
  organizationForwardKindHasAvailableLocation,
  LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON,
  ORGANIZATION_DRAWER_FULLY_LINKED_REASONS,
  resolveKindsForOrganizationDrawerIntent,
  type OrganizationConnectionDrawerIntent,
} from './location-connection-drawer-intent'
import {
  resolveTerritorialKindOccupiedReason,
  TERRITORIAL_AUTHORITY_DRAWER,
} from '../locations/lib/location-connection-surface-copy'

export type LocationConnectionKindOption = {
  value: string
  label: string
  description: string
  disabled?: boolean
  disabledReason?: string
}

export const LOCATION_CONNECTION_KIND_FIELD_LABEL = 'Connection type'

/** @deprecated Use LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON from drawer-intent module. */
export const LOCATION_CONNECTION_ALREADY_LINKED_REASON = 'Already linked with this connection type.'

export function buildOrganizationLocationConnectionDisabledKinds(input: {
  locationId: string
  kinds: readonly OrganizationLocationConnectionKind[]
  subjectOrganizationId: string
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>
  edgesAtLocation?: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
}): Set<OrganizationLocationConnectionKind> {
  return new Set(
    input.kinds.filter((kind) =>
      isOrganizationLocationConnectionKindBlockedForLocation({
        locationId: input.locationId,
        kind,
        subjectOrganizationId: input.subjectOrganizationId,
        connections: input.connections,
        edgesAtLocation: input.edgesAtLocation,
        excludeConnectionId: input.excludeConnectionId,
      }),
    ),
  )
}

function resolveOrganizationLocationConnectionKindDescription(
  kind: OrganizationLocationConnectionKind,
): string {
  return ORGANIZATION_LOCATION_CONNECTION_ENTRIES[kind].description
}

function resolveOrganizationLocationConnectionKindDisabledReason(input: {
  locationId: string
  kind: OrganizationLocationConnectionKind
  subjectOrganizationId?: string
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>
  edgesAtLocation?: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
}): string | undefined {
  const perOrgBlocked = organizationLocationConnectionKindBlockedForOrganizationAtLocation({
    locationId: input.locationId,
    kind: input.kind,
    connections: input.connections,
    excludeConnectionId: input.excludeConnectionId,
  })

  if (perOrgBlocked) {
    if (input.kind === 'claims') {
      return TERRITORIAL_AUTHORITY_DRAWER.duplicateClaimReason
    }
    return LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON
  }

  if (!input.edgesAtLocation) {
    return undefined
  }

  const occupant = resolveOrganizationLocationConnectionLocationOccupant({
    locationId: input.locationId,
    kind: input.kind,
    edgesAtLocation: input.edgesAtLocation,
    excludeConnectionId: input.excludeConnectionId,
  })

  if (!occupant) {
    return undefined
  }

  if (input.subjectOrganizationId && occupant.organizationId === input.subjectOrganizationId) {
    return undefined
  }

  if (input.kind === 'governs' || input.kind === 'controls') {
    const occupantName = occupant.subjectName ?? 'Another organization'
    return resolveTerritorialKindOccupiedReason({
      kind: input.kind,
      occupantName,
    })
  }

  return LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON
}

export function buildOrganizationLocationConnectionKindOptions(input: {
  locationId: string
  kinds: readonly OrganizationLocationConnectionKind[]
  subjectOrganizationId?: string
  connections?: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>
  edgesAtLocation?: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
}): LocationConnectionKindOption[] {
  const connections = input.connections ?? []

  return input.kinds.map((kind) => {
    const disabled = isOrganizationLocationConnectionKindBlockedForLocation({
      locationId: input.locationId,
      kind,
      subjectOrganizationId: input.subjectOrganizationId ?? '',
      connections,
      edgesAtLocation: input.edgesAtLocation,
      excludeConnectionId: input.excludeConnectionId,
    })

    return {
      value: kind,
      label: getOrganizationLocationConnectionLabel(kind),
      description: resolveOrganizationLocationConnectionKindDescription(kind),
      disabled,
      disabledReason: disabled
        ? resolveOrganizationLocationConnectionKindDisabledReason({
            locationId: input.locationId,
            kind,
            subjectOrganizationId: input.subjectOrganizationId,
            connections,
            edgesAtLocation: input.edgesAtLocation,
            excludeConnectionId: input.excludeConnectionId,
          })
        : undefined,
    }
  })
}

export function buildOrganizationFamilyKindOptions(input: {
  intent: OrganizationConnectionDrawerIntent
  locations: readonly Location[]
  subjectOrganizationId: string
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>
  edgesByLocationId?: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >
  excludeConnectionId?: string
  occupancyLoaded?: boolean
}): LocationConnectionKindOption[] {
  const occupancyLoaded = input.occupancyLoaded ?? true
  const kinds = resolveKindsForOrganizationDrawerIntent(input.intent)

  return kinds.map((kind) => {
    const hasAvailableLocation = organizationForwardKindHasAvailableLocation(
      kind,
      input.locations,
      input.subjectOrganizationId,
      input.connections,
      input.edgesByLocationId,
      input.excludeConnectionId,
      occupancyLoaded,
    )

    return {
      value: kind,
      label: getOrganizationLocationConnectionLabel(kind),
      description: resolveOrganizationLocationConnectionKindDescription(kind),
      disabled: !hasAvailableLocation,
      disabledReason: !hasAvailableLocation
        ? ORGANIZATION_DRAWER_FULLY_LINKED_REASONS[input.intent]
        : undefined,
    }
  })
}

export function buildCharacterLocationConnectionKindOptions(
  kinds: readonly CharacterLocationConnectionKind[],
  disabledKinds: ReadonlySet<CharacterLocationConnectionKind> = new Set(),
): LocationConnectionKindOption[] {
  return kinds.map((kind) => ({
    value: kind,
    label: getCharacterLocationConnectionLabel(kind),
    description: CHARACTER_LOCATION_CONNECTION_ENTRIES[kind].description,
    disabled: disabledKinds.has(kind),
    disabledReason: disabledKinds.has(kind)
      ? LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON
      : undefined,
  }))
}

export function resolveActiveConnectionKind(
  selectedKind: string | null,
  kindOptions: readonly LocationConnectionKindOption[],
): string | null {
  const enabledOptions = kindOptions.filter((option) => !option.disabled)
  if (enabledOptions.length === 1) {
    return enabledOptions[0]?.value ?? null
  }

  if (
    selectedKind &&
    kindOptions.some((option) => option.value === selectedKind && !option.disabled)
  ) {
    return selectedKind
  }

  return null
}
