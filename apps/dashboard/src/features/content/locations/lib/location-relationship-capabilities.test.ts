import { describe, expect, it } from 'vitest'

import { TERRITORIAL_AUTHORITY_KIND_IDS } from '@rpg/contracts'

import { LOCATION_AUTHORING_TYPE_IDS } from './location-authoring-type'
import {
  assertLocationRelationshipCapabilitiesExhaustive,
  getLocationRelationshipCapabilities,
  LOCATION_RELATIONSHIP_CAPABILITIES,
} from './location-relationship-capabilities'

describe('location relationship capabilities', () => {
  it('covers every LocationAuthoringType exactly once', () => {
    assertLocationRelationshipCapabilitiesExhaustive()
    expect(Object.keys(LOCATION_RELATIONSHIP_CAPABILITIES).sort()).toEqual(
      [...LOCATION_AUTHORING_TYPE_IDS].sort(),
    )
  })

  it('enables region party operator only', () => {
    expect(getLocationRelationshipCapabilities('region').partyAssociationSemanticKeys).toEqual([
      'operator',
    ])
  })

  it('enables all territorial authority kinds for region only', () => {
    expect(getLocationRelationshipCapabilities('region').territorialAuthorityKinds).toEqual([
      ...TERRITORIAL_AUTHORITY_KIND_IDS,
    ])

    for (const authoringType of LOCATION_AUTHORING_TYPE_IDS) {
      if (authoringType === 'region') continue
      expect(getLocationRelationshipCapabilities(authoringType).territorialAuthorityKinds).toEqual(
        [],
      )
    }
  })
})
