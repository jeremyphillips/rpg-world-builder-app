import type { LocationConnectedPartyRow } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { applyPeopleKindSlotDownstreamState } from './apply-people-kind-slot-downstream-state.lib'
import type { PeopleKindSlot } from '../../locations/lib/location-connected-parties-people-kind-slots'

const ownerSlot: PeopleKindSlot = {
  heading: 'Owner',
  bindings: [
    { subjectType: 'organization', kind: 'owns' },
    { subjectType: 'character', kind: 'owns' },
  ],
}

const headquartersSlot: PeopleKindSlot = {
  heading: 'Headquarters',
  bindings: [{ subjectType: 'organization', kind: 'headquarters' }],
}

function organizationOwnsRow(organizationId = 'org-1'): LocationConnectedPartyRow {
  return {
    relationshipId: 'conn-1',
    subjectType: 'organization',
    subject: {
      type: 'organization',
      id: organizationId,
      name: 'City Council',
      slug: 'city-council',
    },
    kind: 'owns',
    family: 'site',
    label: 'Owner',
    priority: 1,
    sectionGroup: 'people_and_organizations',
  }
}

describe('applyPeopleKindSlotDownstreamState', () => {
  it('preserves subject type override when the next slot still supports it', () => {
    const result = applyPeopleKindSlotDownstreamState({
      nextSlot: ownerSlot,
      locationId: 'loc-1',
      canAddOrganization: true,
      canAddCharacter: true,
      subjectTypeOverride: 'organization',
      selectedOrganizationId: 'org-1',
      selectedCharacterId: null,
      orgRows: [],
      characterRows: [],
    })

    expect(result.subjectTypeOverride).toBe('organization')
    expect(result.selectedOrganizationId).toBe('org-1')
    expect(result.selectedCharacterId).toBeNull()
  })

  it('clears subject type override when the next slot no longer supports it', () => {
    const result = applyPeopleKindSlotDownstreamState({
      nextSlot: headquartersSlot,
      locationId: 'loc-1',
      canAddOrganization: true,
      canAddCharacter: true,
      subjectTypeOverride: 'character',
      selectedOrganizationId: null,
      selectedCharacterId: 'char-1',
      orgRows: [],
      characterRows: [],
    })

    expect(result.subjectTypeOverride).toBeNull()
    expect(result.selectedOrganizationId).toBeNull()
    expect(result.selectedCharacterId).toBeNull()
  })

  it('preserves a still-eligible organization selection after slot change', () => {
    const result = applyPeopleKindSlotDownstreamState({
      nextSlot: ownerSlot,
      locationId: 'loc-1',
      canAddOrganization: true,
      canAddCharacter: true,
      subjectTypeOverride: 'organization',
      selectedOrganizationId: 'org-1',
      selectedCharacterId: null,
      orgRows: [],
      characterRows: [],
    })

    expect(result.selectedOrganizationId).toBe('org-1')
  })

  it('clears organization selection when the binding is no longer eligible', () => {
    const result = applyPeopleKindSlotDownstreamState({
      nextSlot: ownerSlot,
      locationId: 'loc-1',
      canAddOrganization: true,
      canAddCharacter: true,
      subjectTypeOverride: 'organization',
      selectedOrganizationId: 'org-1',
      selectedCharacterId: null,
      orgRows: [organizationOwnsRow()],
      characterRows: [],
    })

    expect(result.selectedOrganizationId).toBeNull()
  })
})
