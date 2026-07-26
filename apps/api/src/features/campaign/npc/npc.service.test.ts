import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { makeTestUser } from '../../../test/fixtures/users'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { createCampaignNpc, listCampaignNpcs } from './npc.service'

describe('createCampaignNpc', () => {
  it('persists an NPC with open campaign participation', async () => {
    const { id: campaignId } = await makeTestCampaign({
      name: 'NPC Service Campaign',
      owner: await makeTestUser({ email: 'npc-service-owner@example.com' }),
    })

    const detail = await createCampaignNpc(campaignId, minimalNpcRequestInput)

    expect(detail.character).toMatchObject({
      characterType: 'npc',
      name: 'Goblin Scout',
    })
    expect(detail.participation).toMatchObject({
      campaignId,
      roster: { status: 'active' },
    })

    const npcs = await listCampaignNpcs(campaignId)
    expect(npcs).toHaveLength(1)
    expect(npcs[0]?.character.id).toBe(detail.character.id)
  })
})
