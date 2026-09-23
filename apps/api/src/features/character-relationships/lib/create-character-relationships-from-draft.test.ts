import { describe, expect, it } from 'vitest'

import type { CharacterRelationshipDraftEdge } from '@rpg/contracts'

import { toCreateRelationshipInput } from './create-character-relationships-from-draft.lib'

describe('createCharacterRelationshipsFromDraftEdges', () => {
  it('resolves new-parent and new-child parentOf drafts to stored parent → child direction', () => {
    const newParentEdge: CharacterRelationshipDraftEdge = {
      id: 'edge-parent',
      kind: 'parentOf',
      characterId: '__new_character__',
      relatedCharacterId: 'char-child',
    }
    const newChildEdge: CharacterRelationshipDraftEdge = {
      id: 'edge-child',
      kind: 'parentOf',
      characterId: 'char-parent',
      relatedCharacterId: '__new_character__',
    }

    expect(toCreateRelationshipInput(newParentEdge, 'char-new')).toEqual({
      kind: 'parentOf',
      characterId: 'char-new',
      relatedCharacterId: 'char-child',
    })
    expect(toCreateRelationshipInput(newChildEdge, 'char-new')).toEqual({
      kind: 'parentOf',
      characterId: 'char-parent',
      relatedCharacterId: 'char-new',
    })
  })

  it('resolves mentorOf drafts so the mentor endpoint is stored on characterId', () => {
    const edge: CharacterRelationshipDraftEdge = {
      id: 'edge-mentor',
      kind: 'mentorOf',
      characterId: 'char-mentor',
      relatedCharacterId: '__new_character__',
    }

    expect(toCreateRelationshipInput(edge, 'char-new')).toEqual({
      kind: 'mentorOf',
      characterId: 'char-mentor',
      relatedCharacterId: 'char-new',
    })
  })
})
