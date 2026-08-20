import type { LocationConnectedPartyRow } from '@rpg/contracts'

import {
  characterInverseSubjectHasAvailableKind,
  organizationInverseSubjectHasAvailableKind,
} from './location-connection-drawer-intent'
import { buildSubjectLocationConnectionKeySet } from './location-connection-duplicate-keys'
import type {
  PeopleConnectionSubjectType,
  PeopleKindBinding,
  PeopleKindSlot,
} from '../../../locations/lib/connected-parties/location-connected-parties-people-kind-slots'
import {
  resolvePeopleKindSlotBinding,
  resolvePeopleKindSlotSelectableSubjectTypes,
} from '../../../locations/lib/connected-parties/location-connected-parties-people-kind-slots'

export type PeopleKindSlotDownstreamState = {
  subjectTypeOverride: PeopleConnectionSubjectType | null
  selectedOrganizationId: string | null
  selectedCharacterId: string | null
}

function resolvePreservedSubjectTypeOverride(
  subjectTypeOverride: PeopleConnectionSubjectType | null,
  selectableSubjectTypes: readonly PeopleConnectionSubjectType[],
): PeopleConnectionSubjectType | null {
  if (!subjectTypeOverride) return null
  return selectableSubjectTypes.includes(subjectTypeOverride) ? subjectTypeOverride : null
}

function resolvePreservedOrganizationSelection(
  binding: PeopleKindBinding | undefined,
  selectedOrganizationId: string | null,
  locationId: string,
  orgRows: readonly LocationConnectedPartyRow[],
): string | null {
  if (binding?.subjectType !== 'organization' || !selectedOrganizationId) return null

  return organizationInverseSubjectHasAvailableKind(
    selectedOrganizationId,
    locationId,
    [binding.kind],
    orgRows,
  )
    ? selectedOrganizationId
    : null
}

function resolvePreservedCharacterSelection(
  binding: PeopleKindBinding | undefined,
  selectedCharacterId: string | null,
  characterRows: readonly LocationConnectedPartyRow[],
): string | null {
  if (binding?.subjectType !== 'character' || !selectedCharacterId) return null

  const characterExistingKeys = buildSubjectLocationConnectionKeySet(characterRows)
  return characterInverseSubjectHasAvailableKind(
    selectedCharacterId,
    [binding.kind],
    characterExistingKeys,
  )
    ? selectedCharacterId
    : null
}

export function applyPeopleKindSlotDownstreamState(input: {
  nextSlot: PeopleKindSlot
  locationId: string
  canAddOrganization: boolean
  canAddCharacter: boolean
  subjectTypeOverride: PeopleConnectionSubjectType | null
  selectedOrganizationId: string | null
  selectedCharacterId: string | null
  orgRows: readonly LocationConnectedPartyRow[]
  characterRows: readonly LocationConnectedPartyRow[]
}): PeopleKindSlotDownstreamState {
  const nextSelectableSubjectTypes = resolvePeopleKindSlotSelectableSubjectTypes({
    slot: input.nextSlot,
    canAddOrganization: input.canAddOrganization,
    canAddCharacter: input.canAddCharacter,
  })

  const subjectTypeOverride = resolvePreservedSubjectTypeOverride(
    input.subjectTypeOverride,
    nextSelectableSubjectTypes,
  )

  const effectiveSubjectType = subjectTypeOverride ?? nextSelectableSubjectTypes[0] ?? null
  const binding = effectiveSubjectType
    ? resolvePeopleKindSlotBinding(input.nextSlot, effectiveSubjectType)
    : undefined

  return {
    subjectTypeOverride,
    selectedOrganizationId: resolvePreservedOrganizationSelection(
      binding,
      input.selectedOrganizationId,
      input.locationId,
      input.orgRows,
    ),
    selectedCharacterId: resolvePreservedCharacterSelection(
      binding,
      input.selectedCharacterId,
      input.characterRows,
    ),
  }
}
