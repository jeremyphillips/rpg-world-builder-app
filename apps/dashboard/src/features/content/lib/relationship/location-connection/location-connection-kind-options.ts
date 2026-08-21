import type {
  CharacterLocationConnectionKind,
  Location,
  OrganizationLocationConnectionEdgeAtLocation,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  CHARACTER_LOCATION_CONNECTION_ENTRIES,
  findOrganizationLocationConnectionOfKindForOrganization,
  getCharacterLocationConnectionDisplayLabel,
  getCharacterLocationConnectionLabel,
  getOrganizationLocationConnectionDisplayLabel,
  getOrganizationLocationConnectionLabel,
  ORGANIZATION_LOCATION_CONNECTION_ENTRIES,
  organizationLocationConnectionAlreadySetAtReason,
  organizationLocationConnectionKindBlockedForOrganization,
  organizationLocationConnectionKindBlockedForOrganizationAtLocation,
  resolveOrganizationLocationConnectionLocationOccupant,
} from '@rpg/contracts'

import { isOrganizationLocationConnectionKindBlockedForLocation } from './location-connection-duplicate-keys'
import {
  organizationForwardKindHasAvailableLocation,
  LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON,
  ORGANIZATION_DRAWER_FULLY_LINKED_REASONS,
  resolveKindsForOrganizationDrawerIntent,
  resolveOrganizationKindsForDrawerIntent,
  type OrganizationConnectionDrawerIntent,
} from './location-connection-drawer-intent'
import type { LocationConnectionKindOptionsCopy } from './location-connection-kind-options-copy'

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
  copy: LocationConnectionKindOptionsCopy
}): string | undefined {
  const perOrgBlocked = organizationLocationConnectionKindBlockedForOrganizationAtLocation({
    locationId: input.locationId,
    kind: input.kind,
    connections: input.connections,
    excludeConnectionId: input.excludeConnectionId,
  })

  if (perOrgBlocked) {
    if (input.kind === 'claims') {
      return input.copy.duplicateClaimReason
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
    return input.copy.resolveTerritorialKindOccupiedReason({
      kind: input.kind,
      occupantName,
    })
  }

  return LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON
}

export const ORGANIZATION_LOCATION_CONNECTION_STALE_CURRENT_KIND_REASON =
  'This connection type is no longer eligible at this location.' as const

/** Full change-kind picker options at a fixed location — includes the persisted current kind. */
export function buildOrganizationLocationChangeKindOptions(input: {
  location: Location
  intent: OrganizationConnectionDrawerIntent
  currentKind: OrganizationLocationConnectionKind
  subjectOrganizationId: string
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>
  edgesAtLocation?: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
  copy: LocationConnectionKindOptionsCopy
}): LocationConnectionKindOption[] {
  const profileKinds = resolveOrganizationKindsForDrawerIntent(input.location, input.intent)
  const currentKindStale = !profileKinds.includes(input.currentKind)
  const kinds = currentKindStale ? [input.currentKind, ...profileKinds] : profileKinds

  const options = buildOrganizationInverseLocationConnectionKindOptions({
    location: input.location,
    kinds,
    subjectOrganizationId: input.subjectOrganizationId,
    connections: input.connections,
    edgesAtLocation: input.edgesAtLocation,
    excludeConnectionId: input.excludeConnectionId,
    copy: input.copy,
  })

  if (!currentKindStale) {
    return options
  }

  return options.map((option) =>
    option.value === input.currentKind
      ? {
          ...option,
          disabled: true,
          disabledReason: ORGANIZATION_LOCATION_CONNECTION_STALE_CURRENT_KIND_REASON,
        }
      : option,
  )
}

export function assertChangeKindPickerIncludesCurrentKind(
  options: readonly LocationConnectionKindOption[],
  currentKind: OrganizationLocationConnectionKind,
): void {
  if (!options.some((option) => option.value === currentKind)) {
    throw new Error(`Change-kind picker must include the persisted current kind (${currentKind}).`)
  }
}

export function assertChangeKindGatingAlignsWithPicker(input: {
  gatingAlternates: readonly LocationConnectionKindOption[] | undefined
  pickerOptions: readonly LocationConnectionKindOption[]
  currentKind: OrganizationLocationConnectionKind
}): void {
  assertChangeKindPickerIncludesCurrentKind(input.pickerOptions, input.currentKind)

  const selectableNonCurrentKinds = input.pickerOptions.filter(
    (option) => option.value !== input.currentKind && !option.disabled,
  )

  if ((input.gatingAlternates?.length ?? 0) > 0 && selectableNonCurrentKinds.length === 0) {
    throw new Error(
      'Change-kind gating reported alternates, but the picker has no selectable non-current kinds.',
    )
  }

  if ((input.gatingAlternates?.length ?? 0) === 0 && selectableNonCurrentKinds.length > 0) {
    throw new Error(
      'Change-kind picker has selectable non-current kinds, but gating reported no alternates.',
    )
  }
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
  copy: LocationConnectionKindOptionsCopy
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
            copy: input.copy,
          })
        : undefined,
    }
  })
}

export function buildOrganizationInverseLocationConnectionKindOptions(input: {
  location: Location
  kinds: readonly OrganizationLocationConnectionKind[]
  subjectOrganizationId?: string
  connections?: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>
  edgesAtLocation?: readonly OrganizationLocationConnectionEdgeAtLocation[]
  excludeConnectionId?: string
  copy: LocationConnectionKindOptionsCopy
}): LocationConnectionKindOption[] {
  const connections = input.connections ?? []

  return input.kinds.map((kind) => {
    const disabled = isOrganizationLocationConnectionKindBlockedForLocation({
      locationId: input.location.id,
      kind,
      subjectOrganizationId: input.subjectOrganizationId ?? '',
      connections,
      edgesAtLocation: input.edgesAtLocation,
      excludeConnectionId: input.excludeConnectionId,
    })

    return {
      value: kind,
      label: getOrganizationLocationConnectionDisplayLabel(kind, 'inverse'),
      description: input.copy.resolveInverseOrganizationKindDescription(kind, input.location),
      disabled,
      disabledReason: disabled
        ? resolveOrganizationLocationConnectionKindDisabledReason({
            locationId: input.location.id,
            kind,
            subjectOrganizationId: input.subjectOrganizationId,
            connections,
            edgesAtLocation: input.edgesAtLocation,
            excludeConnectionId: input.excludeConnectionId,
            copy: input.copy,
          })
        : undefined,
    }
  })
}

function resolveOrganizationFamilyKindUnavailableReason(input: {
  kind: OrganizationLocationConnectionKind
  intent: OrganizationConnectionDrawerIntent
  locations: readonly Location[]
  connections: ReadonlyArray<{
    id?: string
    locationId: string
    kind: OrganizationLocationConnectionKind
  }>
  subjectOrganizationId: string
  edgesByLocationId?: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >
  excludeConnectionId?: string
  occupancyLoaded: boolean
}): string | undefined {
  const orgWideBlocked = organizationLocationConnectionKindBlockedForOrganization({
    kind: input.kind,
    connections: input.connections,
    excludeConnectionId: input.excludeConnectionId,
  })

  const hasAvailableLocation = organizationForwardKindHasAvailableLocation(
    input.kind,
    input.locations,
    input.subjectOrganizationId,
    input.connections,
    input.edgesByLocationId,
    input.excludeConnectionId,
    input.occupancyLoaded,
  )

  if (hasAvailableLocation) {
    return undefined
  }

  if (orgWideBlocked) {
    const existingConnection = findOrganizationLocationConnectionOfKindForOrganization({
      kind: input.kind,
      connections: input.connections,
      excludeConnectionId: input.excludeConnectionId,
    })
    const locationName =
      input.locations.find((location) => location.id === existingConnection?.locationId)?.name ??
      'this location'
    return organizationLocationConnectionAlreadySetAtReason(locationName)
  }

  return ORGANIZATION_DRAWER_FULLY_LINKED_REASONS[input.intent]
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
    const disabledReason = resolveOrganizationFamilyKindUnavailableReason({
      kind,
      intent: input.intent,
      locations: input.locations,
      connections: input.connections,
      subjectOrganizationId: input.subjectOrganizationId,
      edgesByLocationId: input.edgesByLocationId,
      excludeConnectionId: input.excludeConnectionId,
      occupancyLoaded,
    })

    return {
      value: kind,
      label: getOrganizationLocationConnectionLabel(kind),
      description: resolveOrganizationLocationConnectionKindDescription(kind),
      disabled: !hasAvailableLocation,
      disabledReason,
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

export function buildCharacterInverseLocationConnectionKindOptions(input: {
  location: Location
  kinds: readonly CharacterLocationConnectionKind[]
  disabledKinds?: ReadonlySet<CharacterLocationConnectionKind>
  copy: LocationConnectionKindOptionsCopy
}): LocationConnectionKindOption[] {
  const disabledKinds = input.disabledKinds ?? new Set<CharacterLocationConnectionKind>()

  return input.kinds.map((kind) => ({
    value: kind,
    label: getCharacterLocationConnectionDisplayLabel(kind, 'inverse'),
    description: input.copy.resolveInverseCharacterKindDescription(kind, input.location),
    disabled: disabledKinds.has(kind),
    disabledReason: disabledKinds.has(kind)
      ? LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON
      : undefined,
  }))
}

/** True when the host may offer Change / summary reopen for a completed kind decision. */
export function canReopenConnectionKindDecision(
  options: readonly LocationConnectionKindOption[],
): boolean {
  return options.length > 1
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
