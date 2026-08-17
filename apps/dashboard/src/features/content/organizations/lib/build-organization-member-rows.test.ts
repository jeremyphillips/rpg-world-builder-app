import type { OrganizationMembersResponse } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { buildOrganizationMemberRows } from './build-organization-member-rows'

const members: OrganizationMembersResponse = {
  items: [
    {
      characterType: 'npc',
      character: {
        id: 'npc-1',
        name: 'Circle Envoy',
        summary: 'Human · Level 3 Rogue',
        classIds: [],
      },
      membership: { title: 'Speaker', priority: 50 },
    },
    {
      characterType: 'pc',
      character: { id: 'char-1', name: 'Verna', summary: 'Dwarf · Level 1 Fighter', classIds: [] },
      membership: {},
    },
  ],
  total: 2,
}

describe('buildOrganizationMemberRows', () => {
  it('maps membership metadata, identity line, and campaign detail hrefs', () => {
    expect(buildOrganizationMemberRows(members, { campaignId: 'camp-1' })).toEqual({
      total: 2,
      rows: [
        {
          characterId: 'npc-1',
          characterType: 'npc',
          name: 'Circle Envoy',
          title: 'Speaker',
          priority: 50,
          identityLine: 'NPC · Human · Level 3 Rogue',
          detailHref: '/campaigns/camp-1/npcs/npc-1',
        },
        {
          characterId: 'char-1',
          characterType: 'pc',
          name: 'Verna',
          identityLine: 'PC · Dwarf · Level 1 Fighter',
          detailHref: '/campaigns/camp-1/characters/char-1',
        },
      ],
    })
  })

  it('preserves the API roster order rather than re-sorting', () => {
    const rows = buildOrganizationMemberRows(members, { campaignId: 'camp-1' }).rows
    expect(rows.map((row) => row.characterId)).toEqual(['npc-1', 'char-1'])
  })
})
