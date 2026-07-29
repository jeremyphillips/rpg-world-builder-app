import { describe, expect, it } from 'vitest'

import { buildOrganizationConnectedCharacterCards } from './build-organization-connected-character-cards'

describe('buildOrganizationConnectedCharacterCards', () => {
  it('maps connected character summaries to preview items with campaign detail hrefs', () => {
    expect(
      buildOrganizationConnectedCharacterCards(
        {
          items: [
            {
              characterType: 'pc',
              character: {
                id: 'char-1',
                name: 'Verna',
                summary: 'Dwarf · Level 1 Fighter',
              },
            },
            {
              characterType: 'npc',
              character: {
                id: 'npc-1',
                name: 'Envoy',
                summary: 'Human · Level 3 Rogue',
              },
            },
          ],
          total: 5,
        },
        { campaignId: 'camp-1' },
      ),
    ).toEqual({
      previewItems: [
        {
          card: {
            id: 'char-1',
            name: 'Verna',
            summary: 'Dwarf · Level 1 Fighter',
          },
          detailHref: '/campaigns/camp-1/characters/char-1',
        },
        {
          card: {
            id: 'npc-1',
            name: 'Envoy',
            summary: 'Human · Level 3 Rogue',
          },
          detailHref: '/campaigns/camp-1/npcs/npc-1',
        },
      ],
      total: 5,
    })
  })
})
