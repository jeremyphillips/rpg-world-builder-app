import { describe, expect, it } from 'vitest'

import { characterRelationshipEdgeSchema } from './relationship'

const baseEnvelope = {
  id: 'edge-1',
  campaignId: 'campaign-1',
  revision: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdByUserId: 'user-1',
  visibility: 'dm_only',
} as const

describe('characterRelationshipEdgeSchema', () => {
  it('accepts organization membership edges', () => {
    const parsed = characterRelationshipEdgeSchema.parse({
      ...baseEnvelope,
      kind: 'organizationMembership',
      characterId: 'pc-1',
      organizationId: 'org-1',
      details: { lifecycle: 'current', title: 'Captain' },
    })

    expect(parsed.kind).toBe('organizationMembership')
  })

  it('rejects mismatched details payloads', () => {
    expect(() =>
      characterRelationshipEdgeSchema.parse({
        ...baseEnvelope,
        kind: 'parentOf',
        characterId: 'pc-1',
        relatedCharacterId: 'pc-2',
        details: { lifecycle: 'current' },
      }),
    ).toThrow()
  })

  it('accepts symmetric sibling edges with empty person details', () => {
    const parsed = characterRelationshipEdgeSchema.parse({
      ...baseEnvelope,
      kind: 'siblingOf',
      characterId: 'pc-1',
      relatedCharacterId: 'pc-2',
      details: {},
    })

    expect(parsed.kind).toBe('siblingOf')
  })
})
