import { describe, expect, it } from 'vitest'

import { createPcRecord } from '../../character'
import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { minimalStandalonePcInput } from '../../../test/fixtures/characters'
import { makeTestUser } from '../../../test/fixtures/users'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { seedCharacterParticipation } from '../../../test/helpers/campaign-participation'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createCampaignNpc, listCampaignNpcs } from './npc.service'

useIntegrationDb()

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

describe('listCampaignNpcs', () => {
  it('returns NPCs and ignores open PC participations in the same campaign', async () => {
    const player = await makeTestUser({ email: 'npc-list-player@example.com' })
    const { id: campaignId } = await makeTestCampaign({
      name: 'NPC List Mixed Campaign',
      owner: await makeTestUser({ email: 'npc-list-owner@example.com' }),
    })

    const npcDetail = await createCampaignNpc(campaignId, minimalNpcRequestInput)
    const pc = await createPcRecord(minimalStandalonePcInput, player.id)
    await seedCharacterParticipation({ campaignId, characterId: pc.id })

    const npcs = await listCampaignNpcs(campaignId)

    expect(npcs).toHaveLength(1)
    expect(npcs[0]?.character.id).toBe(npcDetail.character.id)
  })
})
