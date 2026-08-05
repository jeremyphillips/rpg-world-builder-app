import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { finalizeNpcCharacterBuild } from './finalize-npc'
import { builderTestContext } from '../test-fixtures'

describe('finalizeNpcCharacterBuild', () => {
  it('returns a CreateNpcRequestInput without ownership fields', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Test Character', alignment: 'ng' as const },
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
      abilities: {
        method: 'standard-array' as const,
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    }
    const input = finalizeNpcCharacterBuild(draft, builderTestContext)

    expect(input).toMatchObject({
      name: 'Test Character',
      rulesetId: 'srd-cc-5.2.1' as const,
    })
    expect(input).not.toHaveProperty('characterType')
    expect(input).not.toHaveProperty('campaignId')
  })

  it('copies organization connections to the NPC request', () => {
    const organization = {
      id: 'organization-lantern-guild',
      slug: 'lantern-guild',
      rulesetId: 'srd-cc-5.2.1' as const,
      source: 'homebrew' as const,
      status: 'published' as const,
      campaignId: 'campaign-1',
      createdAt: '2026-07-28T12:00:00.000Z',
      updatedAt: '2026-07-28T12:00:00.000Z',
      name: 'Lantern Guild',
      organizationKind: 'professional' as const,
    }
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Test Character', alignment: 'ng' as const },
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
      abilities: {
        method: 'standard-array' as const,
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
      connections: { organizations: [{ organizationId: organization.id }], locations: [] },
    }
    const input = finalizeNpcCharacterBuild(draft, {
      ...builderTestContext,
      catalog: { ...builderTestContext.catalog, organizations: [organization] },
    })

    expect(input.connections).toEqual({
      organizations: [{ organizationId: organization.id }],
      locations: [],
    })
  })
})
