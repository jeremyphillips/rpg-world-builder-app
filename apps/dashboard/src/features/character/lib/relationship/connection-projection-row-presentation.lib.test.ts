import { describe, expect, it } from 'vitest'

import type { CharacterRelationshipProjectionRow } from '@rpg/contracts'

import {
  resolveProjectionRowMetadataSummary,
  resolveProjectionRowPresentation,
} from './connection-projection-row-presentation.lib'

const baseRow = {
  relationshipId: 'edge-1',
  section: 'people.social' as const,
  visibility: 'dm_only' as const,
  referenceStatus: 'resolved' as const,
  revision: 1,
  capabilities: { canUpdateDetails: true, canDelete: true },
}

describe('resolveProjectionRowPresentation', () => {
  it('builds metadata summary with membership title and primary residence', () => {
    const membershipRow: CharacterRelationshipProjectionRow = {
      ...baseRow,
      kind: 'organizationMembership',
      roleLabel: 'Member',
      details: { lifecycle: 'current', title: 'Captain' },
      target: { type: 'organization', id: 'org-1', name: 'Lantern Guild', slug: 'lantern-guild' },
    }

    expect(resolveProjectionRowMetadataSummary(membershipRow)).toBe('Member · Captain')

    const residenceRow: CharacterRelationshipProjectionRow = {
      ...baseRow,
      kind: 'resides_at',
      roleLabel: 'Residence',
      details: { lifecycle: 'current', isPrimary: true },
      target: { type: 'location', id: 'loc-1', name: 'Harborford', slug: 'harborford' },
    }

    expect(resolveProjectionRowMetadataSummary(residenceRow)).toBe('Residence · Primary')
  })

  it('exposes a detail href for resolved targets', () => {
    const row: CharacterRelationshipProjectionRow = {
      ...baseRow,
      kind: 'friendOf',
      roleLabel: 'Friend',
      details: { lifecycle: 'current' },
      target: {
        type: 'character',
        id: 'npc-1',
        name: 'Darius Vale',
        characterType: 'npc',
      },
    }

    const presentation = resolveProjectionRowPresentation(row, 'campaign-1')

    expect(presentation.heading).toBe('Darius Vale')
    expect(presentation.headingHref).toBe('/campaigns/campaign-1/npcs/npc-1')
    expect(presentation.canViewRecord).toBe(true)
  })
})
