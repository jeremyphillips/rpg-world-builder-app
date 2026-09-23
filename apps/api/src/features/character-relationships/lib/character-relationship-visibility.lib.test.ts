import { describe, expect, it } from 'vitest'

import type { CharacterRelationshipEdge } from '@rpg/contracts'

import { canViewerSeeCharacterRelationship } from './character-relationship-visibility.lib'

const baseRelationship = {
  id: 'edge-1',
  campaignId: 'camp-1',
  revision: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdByUserId: 'manager-1',
  visibility: 'dm_only' as const,
  kind: 'organizationMembership' as const,
  characterId: 'char-1',
  organizationId: 'org-1',
  details: { lifecycle: 'current' },
} satisfies CharacterRelationshipEdge

describe('canViewerSeeCharacterRelationship', () => {
  it('hides dm_only edges from non-manager viewers', () => {
    expect(
      canViewerSeeCharacterRelationship(baseRelationship, {
        viewerUserId: 'player-1',
        viewerRole: 'pc',
      }),
    ).toBe(false)
    expect(
      canViewerSeeCharacterRelationship(baseRelationship, {
        viewerUserId: 'manager-1',
        viewerRole: 'owner',
      }),
    ).toBe(true)
  })

  it('shows all_players edges to participating viewers', () => {
    expect(
      canViewerSeeCharacterRelationship(
        { ...baseRelationship, visibility: 'all_players' },
        { viewerUserId: 'player-1', viewerRole: 'pc' },
      ),
    ).toBe(true)
  })
})
