import { describe, expect, it } from 'vitest'

import {
  CROSS_CONTENT_RELATIONSHIP_CAPABILITIES,
  CROSS_CONTENT_RELATIONSHIP_PROJECTION_IDS,
  CROSS_CONTENT_RELATIONSHIP_PROJECTIONS,
  canInverseWriteCrossContentRelationship,
  getCrossContentRelationshipProjection,
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

  it('keeps territorial authority inverse read-only until inverse writes ship', () => {
    expect(canInverseWriteCrossContentRelationship('region_territorial_authority')).toBe(false)
    expect(canInverseWriteCrossContentRelationship('location_party_association')).toBe(false)
    expect(canInverseWriteCrossContentRelationship('class_skill_proficiency_choice')).toBe(false)
  })
})
