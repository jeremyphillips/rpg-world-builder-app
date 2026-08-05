import { describe, expect, it } from 'vitest'

import {
  CROSS_CONTENT_RELATIONSHIP_CAPABILITIES,
  CROSS_CONTENT_RELATIONSHIP_PROJECTION_IDS,
  CROSS_CONTENT_RELATIONSHIP_PROJECTIONS,
  canInverseWriteAnyLocationConnection,
  canInverseWriteCrossContentRelationship,
  canInverseWriteLocationConnectionForOwner,
  getCrossContentRelationshipProjection,
  getLocationConnectionProjectionIdForOwner,
  LOCATION_CONNECTION_CROSS_CONTENT_PROJECTION_IDS,
} from './cross-content-relationship-projection'

describe('cross-content relationship projection registry', () => {
  it('declares every projection id with required fields and valid capability enums', () => {
    expect(Object.keys(CROSS_CONTENT_RELATIONSHIP_PROJECTIONS).sort()).toEqual(
      [...CROSS_CONTENT_RELATIONSHIP_PROJECTION_IDS].sort(),
    )

    for (const id of CROSS_CONTENT_RELATIONSHIP_PROJECTION_IDS) {
      const projection = getCrossContentRelationshipProjection(id)

      expect(projection.id).toBe(id)
      expect(projection.ownerContentType).not.toBe('')
      expect(projection.targetContentType).not.toBe('')
      expect(projection.ownerField.trim()).not.toBe('')
      expect(CROSS_CONTENT_RELATIONSHIP_CAPABILITIES).toContain(projection.capabilities.forward)
      expect(CROSS_CONTENT_RELATIONSHIP_CAPABILITIES).toContain(projection.capabilities.inverse)
    }
  })

  it('enables inverse writes for subject-owned location connections only', () => {
    expect(canInverseWriteCrossContentRelationship('character_location_connection')).toBe(true)
    expect(canInverseWriteCrossContentRelationship('organization_location_connection')).toBe(true)
    expect(canInverseWriteCrossContentRelationship('class_skill_proficiency_choice')).toBe(false)
  })

  it('indexes location connection projections and owner lookup helpers', () => {
    expect(LOCATION_CONNECTION_CROSS_CONTENT_PROJECTION_IDS).toEqual([
      'character_location_connection',
      'organization_location_connection',
    ])
    expect(getLocationConnectionProjectionIdForOwner('characters')).toBe(
      'character_location_connection',
    )
    expect(getLocationConnectionProjectionIdForOwner('organizations')).toBe(
      'organization_location_connection',
    )
    expect(canInverseWriteLocationConnectionForOwner('characters')).toBe(true)
    expect(canInverseWriteLocationConnectionForOwner('organizations')).toBe(true)
    expect(canInverseWriteAnyLocationConnection()).toBe(true)
  })
})
