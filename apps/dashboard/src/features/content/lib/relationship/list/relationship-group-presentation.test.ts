import { describe, expect, it } from 'vitest'

import {
  LOCATION_CONNECTED_PARTY_RELATIONSHIP_PRESENTATION,
  ORGANIZATION_LOCATION_CONNECTION_FAMILY_PRESENTATION,
  relationshipGroupUsesLabeledSlotActions,
  relationshipGroupUsesRootFamilyAdd,
  resolveLocationConnectedPartyRelationshipPresentation,
  resolveOrganizationLocationConnectionFamilyPresentation,
} from './relationship-group-presentation'

describe('relationship-group-presentation', () => {
  it('classifies location connected party sections', () => {
    expect(LOCATION_CONNECTED_PARTY_RELATIONSHIP_PRESENTATION).toEqual({
      territorial_authority: 'meaningful_slots',
      people_and_organizations: 'sparse_groups',
    })
    expect(resolveLocationConnectedPartyRelationshipPresentation('territorial_authority')).toBe(
      'meaningful_slots',
    )
    expect(resolveLocationConnectedPartyRelationshipPresentation('people_and_organizations')).toBe(
      'sparse_groups',
    )
  })

  it('classifies organization location connection families as sparse groups', () => {
    expect(ORGANIZATION_LOCATION_CONNECTION_FAMILY_PRESENTATION).toEqual({
      site: 'sparse_groups',
      geographic_presence: 'sparse_groups',
      territorial_authority: 'sparse_groups',
    })
    expect(resolveOrganizationLocationConnectionFamilyPresentation('site')).toBe('sparse_groups')
  })

  it('maps presentation modes to RelationshipList action placement', () => {
    expect(relationshipGroupUsesLabeledSlotActions('meaningful_slots')).toBe(true)
    expect(relationshipGroupUsesLabeledSlotActions('sparse_groups')).toBe(false)
    expect(relationshipGroupUsesRootFamilyAdd('sparse_groups')).toBe(true)
    expect(relationshipGroupUsesRootFamilyAdd('meaningful_slots')).toBe(false)
  })
})
