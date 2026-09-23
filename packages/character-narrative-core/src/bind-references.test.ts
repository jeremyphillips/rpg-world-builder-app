import { describe, expect, it } from 'vitest'

import type { NarrativeGenerationContext } from '@rpg/contracts/character-narrative'

import { bindNarrativeReferences } from './bind-references'

const baseContext: NarrativeGenerationContext = {
  characterKind: 'npc',
  level: 1,
  affinities: [],
  tokens: {},
  organizations: [],
  residences: [],
  people: [],
  places: [],
  boundConditions: [],
  omittedReferenceIds: [],
}

describe('bindNarrativeReferences', () => {
  it('binds at most one organization, place, and person with role-specific tokens', () => {
    const context: NarrativeGenerationContext = {
      ...baseContext,
      organizations: [
        {
          id: 'org-1',
          name: 'Lantern Guild',
          lifecycle: 'current',
          affinities: ['organization:occupational'],
          provenance: { source: 'draft', draftEdgeId: 'edge-org' },
        },
      ],
      residences: [
        {
          id: 'loc-1',
          name: 'Harborford',
          role: 'residence',
          affinities: ['place:residence'],
          provenance: { source: 'draft', draftEdgeId: 'edge-res' },
        },
      ],
      people: [
        {
          id: 'char-mentor',
          name: 'Seraphina Vale',
          role: 'mentor',
          affinities: ['person:mentor'],
          provenance: { source: 'draft', draftEdgeId: 'edge-mentor' },
        },
      ],
      places: [
        {
          id: 'loc-2',
          name: 'Greyshore',
          role: 'hometown',
          affinities: ['place:hometown'],
          provenance: { source: 'draft', draftEdgeId: 'edge-home' },
        },
      ],
    }

    const { context: bound, plan } = bindNarrativeReferences(context, 'belonging', () => 0)

    expect(bound.tokens['organization.name']).toBe('Lantern Guild')
    expect(bound.tokens['residence.name'] ?? bound.tokens['hometown.name']).toBeTruthy()
    expect(bound.tokens['mentor.name']).toBe('Seraphina Vale')
    expect(bound.boundConditions).toContain('organizationMembership.current')
    expect(plan.organization?.targetId).toBe('org-1')
    expect(plan.person?.role).toBe('mentor')
  })

  it('does not mark former partners as current partner conditions', () => {
    const context: NarrativeGenerationContext = {
      ...baseContext,
      people: [
        {
          id: 'char-partner',
          name: 'Darius Vale',
          role: 'partner',
          lifecycle: 'former',
          affinities: ['person:partner'],
          provenance: { source: 'draft', draftEdgeId: 'edge-partner' },
        },
      ],
    }

    const { context: bound } = bindNarrativeReferences(context, 'belonging', () => 0)

    expect(bound.tokens['partner.name']).toBe('Darius Vale')
    expect(bound.boundConditions).not.toContain('personRole.partner')
  })
})
