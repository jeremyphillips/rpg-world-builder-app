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
  participantIds: [],
  kind: 'organizationMembership' as const,
  characterId: 'char-1',
  organizationId: 'org-1',
  details: { lifecycle: 'current' },
} satisfies CharacterRelationshipEdge

describe('canViewerSeeCharacterRelationship', () => {
  it('hides dm_only edges from non-manager viewers', () => {
    expect(
      canViewerSeeCharacterRelationship(baseRelationship, {
        viewerRole: 'pc',
        viewerCharacterIds: ['pc-1'],
      }),
    ).toBe(false)
    expect(
      canViewerSeeCharacterRelationship(baseRelationship, {
        viewerRole: 'owner',
        viewerCharacterIds: [],
      }),
    ).toBe(true)
  })

  it('shows all_players edges to participating viewers', () => {
    expect(
      canViewerSeeCharacterRelationship(
        { ...baseRelationship, visibility: 'all_players' },
        { viewerRole: 'pc', viewerCharacterIds: ['pc-1'] },
      ),
    ).toBe(true)
  })

  it('shows specific_players edges only to granted PCs', () => {
    expect(
      canViewerSeeCharacterRelationship(
        {
          ...baseRelationship,
          visibility: 'specific_players',
          participantIds: ['pc-1'],
        },
        { viewerRole: 'pc', viewerCharacterIds: ['pc-1'] },
      ),
    ).toBe(true)

    expect(
      canViewerSeeCharacterRelationship(
        {
          ...baseRelationship,
          visibility: 'specific_players',
          participantIds: ['pc-1'],
        },
        { viewerRole: 'pc', viewerCharacterIds: ['pc-2'] },
      ),
    ).toBe(false)
  })

  it('does not grant visibility based on createdByUserId', () => {
    expect(
      canViewerSeeCharacterRelationship(
        {
          ...baseRelationship,
          visibility: 'specific_players',
          participantIds: ['pc-1'],
          createdByUserId: 'player-who-created-edge',
        },
        { viewerRole: 'pc', viewerCharacterIds: ['player-who-created-edge'] },
      ),
    ).toBe(false)
  })
})
