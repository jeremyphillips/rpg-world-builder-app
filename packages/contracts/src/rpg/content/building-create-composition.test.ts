import { describe, expect, it } from 'vitest'

import { buildingCreateCompositionRequestSchema } from './building-create-composition'

const building = {
  status: 'published' as const,
  input: {
    slug: 'clock-tower',
    name: 'Clock Tower',
    kind: 'structure' as const,
    structureType: 'building' as const,
  },
}

const organization = {
  organizationDraftId: 'organization-1',
  status: 'published' as const,
  input: {
    slug: 'clockkeepers',
    name: 'Clockkeepers',
    organizationDomain: 'commercial' as const,
    activities: [],
    connections: { locations: [] },
  },
}

describe('buildingCreateCompositionRequestSchema', () => {
  it('accepts correlated existing and new Organization relationships', () => {
    expect(
      buildingCreateCompositionRequestSchema.parse({
        building,
        organizations: [organization],
        relationships: [
          {
            relationshipDraftId: 'relationship-new',
            kind: 'operator',
            organization: { kind: 'new', organizationDraftId: 'organization-1' },
          },
          {
            relationshipDraftId: 'relationship-existing',
            kind: 'owns',
            organization: { kind: 'existing', organizationId: 'organization-existing' },
          },
        ],
      }),
    ).toMatchObject({ building, organizations: [organization] })
  })

  it('rejects duplicate and dangling draft identities', () => {
    const result = buildingCreateCompositionRequestSchema.safeParse({
      building,
      organizations: [organization, organization],
      relationships: [
        {
          relationshipDraftId: 'relationship-1',
          kind: 'operator',
          organization: { kind: 'new', organizationDraftId: 'missing' },
        },
        {
          relationshipDraftId: 'relationship-1',
          kind: 'owns',
          organization: { kind: 'new', organizationDraftId: 'organization-1' },
        },
      ],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          'Organization draft ids must be unique.',
          'Relationship draft ids must be unique.',
          'Relationship references an unknown organization draft.',
        ]),
      )
    }
  })
})
