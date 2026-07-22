import { describe, expect, it } from 'vitest'

import { resolveContentUsageReferenceHref } from './resolve-content-usage-href'

describe('resolveContentUsageReferenceHref', () => {
  it('links PCs to the standalone character detail route', () => {
    expect(
      resolveContentUsageReferenceHref({
        kind: 'character',
        id: 'pc-1',
        label: 'Verna',
        characterType: 'pc',
      }),
    ).toBe('/characters/pc-1')
  })

  it('links NPCs to the campaign NPC detail route', () => {
    expect(
      resolveContentUsageReferenceHref({
        kind: 'character',
        id: 'npc-1',
        label: 'Goblin Scout',
        characterType: 'npc',
        campaignId: 'camp-1',
      }),
    ).toBe('/campaigns/camp-1/npcs/npc-1')
  })
})
