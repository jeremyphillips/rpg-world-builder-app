import { describe, expect, it } from 'vitest'

import { buildLocationConnectedPartyCharactersById } from './location-connected-party-character-options.lib'

describe('buildLocationConnectedPartyCharactersById', () => {
  it('threads classIds from campaign PCs and NPC class rows', () => {
    const byId = buildLocationConnectedPartyCharactersById(
      [
        {
          character: {
            id: 'char-1',
            name: 'Verna',
            summary: 'Dwarf · Level 1 Fighter',
            classIds: ['srd-cc-5.2.1:fighter'],
            campaign: { id: 'camp-1', name: 'Test Campaign' },
          },
        },
      ],
      [
        {
          character: {
            id: 'npc-1',
            name: 'Circle Envoy',
            vital: { status: 'alive' },
            species: { id: 'srd-cc-5.2.1:human' },
            classes: [
              { classId: 'srd-cc-5.2.1:rogue', level: 3 },
              { classId: 'srd-cc-5.2.1:fighter', level: 1 },
            ],
          },
        },
      ],
      null,
    )

    expect(byId.get('char-1')).toMatchObject({
      classIds: ['srd-cc-5.2.1:fighter'],
    })
    expect(byId.get('npc-1')).toMatchObject({
      classIds: ['srd-cc-5.2.1:rogue', 'srd-cc-5.2.1:fighter'],
    })
  })
})
