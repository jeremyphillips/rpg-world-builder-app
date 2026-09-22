import { describe, expect, it } from 'vitest'

import {
  CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
  normalizeDraftPersonRelationshipEdge,
} from './draft'

describe('draft person relationship normalization', () => {
  it('keeps new-child → existing-parent as parentOf existing parent', () => {
    expect(
      normalizeDraftPersonRelationshipEdge({
        kind: 'parentOf',
        focalEndpoint: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
        relatedEndpoint: 'parent-1',
        role: 'child',
      }),
    ).toEqual({
      characterId: 'parent-1',
      relatedCharacterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
    })
  })

  it('keeps new-parent → existing-child as parentOf new parent', () => {
    expect(
      normalizeDraftPersonRelationshipEdge({
        kind: 'parentOf',
        focalEndpoint: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
        relatedEndpoint: 'child-1',
        role: 'parent',
      }),
    ).toEqual({
      characterId: CHARACTER_RELATIONSHIP_DRAFT_NEW_CHARACTER_ENDPOINT,
      relatedCharacterId: 'child-1',
    })
  })
})
