import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { createCampaignNpc, listCampaignNpcs } from './npc.service'

describe('createCampaignNpc', () => {
  it('persists an NPC scoped to the campaign', async () => {
    const { id: campaignId } = await makeTestCampaign({ name: 'NPC Service Campaign' })

    const npc = await createCampaignNpc(campaignId, minimalNpcRequestInput)

    expect(npc).toMatchObject({
      characterType: 'npc',
      campaignId,
      name: 'Goblin Scout',
    })

    const npcs = await listCampaignNpcs(campaignId)
    expect(npcs).toHaveLength(1)
    expect(npcs[0]?.id).toBe(npc.id)
  })
})
