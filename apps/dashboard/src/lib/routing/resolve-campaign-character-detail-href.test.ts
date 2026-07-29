import { describe, expect, it } from 'vitest'

import { resolveCampaignCharacterDetailHref } from './resolve-campaign-character-detail-href'

describe('resolveCampaignCharacterDetailHref', () => {
  it('routes campaign PCs to the campaign character detail path', () => {
    expect(
      resolveCampaignCharacterDetailHref(
        { campaignId: 'camp-1' },
        {
          characterType: 'pc',
          character: { id: 'char-1', name: 'Verna', summary: 'Dwarf · Level 1 Fighter' },
        },
      ),
    ).toBe('/campaigns/camp-1/characters/char-1')
  })

  it('routes campaign NPCs to the NPC detail path', () => {
    expect(
      resolveCampaignCharacterDetailHref(
        { campaignId: 'camp-1' },
        {
          characterType: 'npc',
          character: { id: 'npc-1', name: 'Envoy', summary: 'Human · Level 3 Rogue' },
        },
      ),
    ).toBe('/campaigns/camp-1/npcs/npc-1')
  })
})
