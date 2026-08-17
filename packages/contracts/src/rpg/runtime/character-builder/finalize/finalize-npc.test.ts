import { describe, expect, it } from 'vitest'

import { createNpcRequestInputSchema } from '../../character/create-npc-input'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import { finalizeNpcCharacterBuild } from './finalize-npc'
import { builderTestContext, createCharacterBuildContext } from '../test-fixtures'

function makeClassedNpcDraft() {
  return {
    ...createEmptyCharacterBuilderDraft(),
    identity: { name: 'Test Character', alignment: 'ng' as const },
    species: { speciesId: 'srd-cc-5.2.1:dwarf' },
    class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
    abilities: {
      method: 'standard-array' as const,
      scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    },
  }
}

describe('finalizeNpcCharacterBuild', () => {
  it('returns a CreateNpcRequestInput without ownership fields', () => {
    const input = finalizeNpcCharacterBuild(makeClassedNpcDraft(), builderTestContext)

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
      organizationDomain: 'occupational' as const,
      functions: [],
      practices: [],
      members: { classAffinityIds: [], speciesAffinityIds: [], titles: [] },
      connections: { locations: [] },
    }
    const draft = {
      ...makeClassedNpcDraft(),
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

  it('finalizes a classless level 0 NPC with empty classes and level-zero wealth', () => {
    const npcContext = createCharacterBuildContext({
      characterKind: 'npc',
      rulesScope: { type: 'campaign', campaignId: 'campaign-1', rulesetId: 'srd-cc-5.2.1' },
      characterCreationRules: {
        ...builderTestContext.characterCreationRules,
        levelZeroNpcs: {
          ...builderTestContext.characterCreationRules.levelZeroNpcs,
          enabled: true,
          baseHitDie: 6,
          standardArray: [12, 11, 10, 9, 8, 7],
          startingWealth: { gp: 5 },
        },
      },
    })
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Commoner', alignment: 'n' as const },
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
      class: { level: 0 as const },
      abilities: {
        method: 'standard-array' as const,
        scores: { str: 12, dex: 11, con: 10, int: 9, wis: 8, cha: 7 },
      },
    }

    const input = finalizeNpcCharacterBuild(draft, npcContext)

    expect(createNpcRequestInputSchema.safeParse(input).success).toBe(true)
    expect(input.classes).toEqual([])
    expect(input.wealth).toEqual({ cp: 0, sp: 0, gp: 5, pp: 0 })
    expect(input.hitPoints).toEqual({ base: 6, current: 6, temporary: 0 })
  })
})
