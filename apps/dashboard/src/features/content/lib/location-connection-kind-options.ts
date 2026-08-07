import type {
  CharacterLocationConnectionKind,
  Location,
  LocationConnectedPartyRow,
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

import {
  buildSubjectLocationConnectionKeySet,
  isOrganizationLocationConnectionKindBlockedForLocation,
} from './location-connection-duplicate-keys'
import {
  characterInverseSubjectHasAvailableKind,
  organizationForwardKindHasAvailableLocation,
  LOCATION_CONNECTION_KIND_ALREADY_LINKED_REASON,
  ORGANIZATION_DRAWER_FULLY_LINKED_REASONS,
  organizationInverseSubjectHasAvailableKind,
  resolveKindsForOrganizationDrawerIntent,
  resolveOrganizationKindsForDrawerIntent,
  type OrganizationConnectionDrawerIntent,
} from './location-connection-drawer-intent'
import {
  resolveTerritorialKindOccupiedReason,
  TERRITORIAL_AUTHORITY_DRAWER,
} from '../locations/lib/location-connection-surface-copy'
import type { PeopleKindSlot } from '../locations/lib/location-connected-parties-people-kind-slots'
import { peopleKindSlotKey } from '../locations/lib/location-connected-parties-people-kind-slots'

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
}): LocationConnectionKindOption[] {
  const profileKinds = resolveOrganizationKindsForDrawerIntent(input.location, input.intent)
  const currentKindStale = !profileKinds.includes(input.currentKind)
  const kinds = currentKindStale ? [input.currentKind, ...profileKinds] : profileKinds

  const options = buildOrganizationLocationConnectionKindOptions({
    locationId: input.location.id,
    kinds,
    subjectOrganizationId: input.subjectOrganizationId,
    connections: input.connections,
    edgesAtLocation: input.edgesAtLocation,
    excludeConnectionId: input.excludeConnectionId,
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

export const PEOPLE_SECTION_KIND_FULLY_LINKED_REASON =
  'All eligible people and organizations are already linked for this relationship type.'

function resolvePeopleKindSlotDescription(slot: PeopleKindSlot): string {
  const organizationBinding = slot.bindings.find(
    (binding) => binding.subjectType === 'organization',
  )
  if (organizationBinding?.subjectType === 'organization') {
    return ORGANIZATION_LOCATION_CONNECTION_ENTRIES[organizationBinding.kind].description
  }

  const characterBinding = slot.bindings.find((binding) => binding.subjectType === 'character')
  if (characterBinding?.subjectType === 'character') {
    return CHARACTER_LOCATION_CONNECTION_ENTRIES[characterBinding.kind].description
  }

  return ''
}

export function peopleKindSlotHasAvailableTarget(input: {
  slot: PeopleKindSlot
  locationId: string
  rows: readonly LocationConnectedPartyRow[]
  organizationIds: readonly string[]
  characterIds: readonly string[]
  canAddOrganization: boolean
  canAddCharacter: boolean
}): boolean {
  const organizationRows = input.rows.filter((row) => row.subject.type === 'organization')
  const characterRows = input.rows.filter((row) => row.subject.type === 'character')
  const characterExistingKeys = buildSubjectLocationConnectionKeySet(characterRows)

  for (const binding of input.slot.bindings) {
    if (binding.subjectType === 'organization' && input.canAddOrganization) {
      const hasOrganizationTarget = input.organizationIds.some((organizationId) =>
        organizationInverseSubjectHasAvailableKind(
          organizationId,
          input.locationId,
          [binding.kind],
          organizationRows,
        ),
      )
      if (hasOrganizationTarget) {
        return true
      }
    }

    if (binding.subjectType === 'character' && input.canAddCharacter) {
      const hasCharacterTarget = input.characterIds.some((characterId) =>
        characterInverseSubjectHasAvailableKind(characterId, [binding.kind], characterExistingKeys),
      )
      if (hasCharacterTarget) {
        return true
      }
    }
  }

  return false
}

export function peopleSectionHasAvailableTarget(input: {
  kindSlots: readonly PeopleKindSlot[]
  locationId: string
  rows: readonly LocationConnectedPartyRow[]
  organizationIds: readonly string[]
  characterIds: readonly string[]
  canAddOrganization: boolean
  canAddCharacter: boolean
}): boolean {
  return input.kindSlots.some((slot) =>
    peopleKindSlotHasAvailableTarget({
      slot,
      locationId: input.locationId,
      rows: input.rows,
      organizationIds: input.organizationIds,
      characterIds: input.characterIds,
      canAddOrganization: input.canAddOrganization,
      canAddCharacter: input.canAddCharacter,
    }),
  )
}

export function buildPeopleSectionKindOptions(input: {
  kindSlots: readonly PeopleKindSlot[]
  locationId: string
  rows: readonly LocationConnectedPartyRow[]
  organizationIds: readonly string[]
  characterIds: readonly string[]
  canAddOrganization: boolean
  canAddCharacter: boolean
}): LocationConnectionKindOption[] {
  return input.kindSlots.map((slot) => {
    const disabled = !peopleKindSlotHasAvailableTarget({
      slot,
      locationId: input.locationId,
      rows: input.rows,
      organizationIds: input.organizationIds,
      characterIds: input.characterIds,
      canAddOrganization: input.canAddOrganization,
      canAddCharacter: input.canAddCharacter,
    })

    return {
      value: peopleKindSlotKey(slot),
      label: slot.heading,
      description: resolvePeopleKindSlotDescription(slot),
      disabled,
      disabledReason: disabled ? PEOPLE_SECTION_KIND_FULLY_LINKED_REASON : undefined,
    }
  })
}

export function resolvePeopleKindSlotFromOptionValue(
  kindSlots: readonly PeopleKindSlot[],
  value: string,
): PeopleKindSlot | undefined {
  return kindSlots.find((slot) => peopleKindSlotKey(slot) === value)
}
