import type { Location, LocationConnectedPartyRow } from '@rpg/contracts'

import { buildSubjectLocationConnectionKeySet } from '../../../lib/relationship/location-connection/location-connection-duplicate-keys'
import {
  characterInverseSubjectHasAvailableKind,
  organizationInverseSubjectHasAvailableKind,
} from '../../../lib/relationship/location-connection/location-connection-drawer-intent'
import type { LocationConnectionKindOption } from '../../../lib/relationship/location-connection/location-connection-kind-options'
import type { LocationConnectionKindOptionsCopy } from '../../../lib/relationship/location-connection/location-connection-kind-options-copy'

import type { PeopleKindSlot } from './location-connected-parties-people-kind-slots'
import { peopleKindSlotKey } from './location-connected-parties-people-kind-slots'

export const PEOPLE_SECTION_KIND_FULLY_LINKED_REASON =
  'All eligible people and organizations are already linked for this relationship type.'

function resolvePeopleKindSlotDescription(
  slot: PeopleKindSlot,
  location: Location,
  copy: LocationConnectionKindOptionsCopy,
): string {
  const organizationBinding = slot.bindings.find(
    (binding) => binding.subjectType === 'organization',
  )
  if (organizationBinding?.subjectType === 'organization') {
    return copy.resolveInverseOrganizationKindDescription(organizationBinding.kind, location)
  }

  const characterBinding = slot.bindings.find((binding) => binding.subjectType === 'character')
  if (characterBinding?.subjectType === 'character') {
    return copy.resolveInverseCharacterKindDescription(characterBinding.kind, location)
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
  location: Location
  kindSlots: readonly PeopleKindSlot[]
  locationId: string
  rows: readonly LocationConnectedPartyRow[]
  organizationIds: readonly string[]
  characterIds: readonly string[]
  canAddOrganization: boolean
  canAddCharacter: boolean
  copy: LocationConnectionKindOptionsCopy
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
      description: resolvePeopleKindSlotDescription(slot, input.location, input.copy),
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
