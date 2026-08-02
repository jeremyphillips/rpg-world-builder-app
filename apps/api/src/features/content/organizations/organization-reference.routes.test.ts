import { describe, expect, it } from 'vitest'
import { Types } from 'mongoose'

import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { useIntegrationApp } from '../../../test/setup/integration-app'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createCampaignNpc } from '../../campaign'
import { CharacterModel } from '../../character'
import { createHomebrewContent } from '../lib/content-write.service'
import { organizationWriteConfig } from './organizations.config'

const getApp = useIntegrationApp()

useIntegrationDb()

const organizationReferencesPath = (campaignId: string, characterId: string) =>
  `/api/campaigns/${campaignId}/content/organizations/references/${characterId}`

async function setOrganizationConnection(characterId: string, organizationId: string) {
  await CharacterModel.collection.updateOne(
    { _id: new Types.ObjectId(characterId) },
    {
      $set: {
        connections: {
          organizations: [{ organizationId }],
        },
      },
    },
  )
}

describe('GET /api/campaigns/:campaignId/content/organizations/references/:characterId', () => {
  it('returns organization references for a participating campaign NPC', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'org-ref-npc-owner@example.com',
      password: 'supersecret',
      displayName: 'Campaign Owner',
    })
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Org Ref NPC Campaign',
    )
    const organization = await createHomebrewContent(organizationWriteConfig, campaignId, {
      slug: 'shadow-guild',
      name: 'Shadow Guild',
      organizationKind: 'other',
    })
    const { character: npc } = await createCampaignNpc(campaignId, {
      ...minimalNpcRequestInput,
      name: 'Guild Contact',
    })
    await setOrganizationConnection(npc.id, organization.id)

    const response = await owner.agent
      .get(organizationReferencesPath(campaignId, npc.id))
      .expect(200)

    expect(response.body.organizationReferences).toEqual([
      {
        organizationId: organization.id,
        organization: expect.objectContaining({
          id: organization.id,
          name: 'Shadow Guild',
        }),
      },
    ])
  })

  it('returns 404 when the character id is not a participating campaign member', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'org-ref-missing-owner@example.com',
      password: 'supersecret',
      displayName: 'Campaign Owner',
    })
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Org Ref Missing Campaign',
    )

    const response = await owner.agent
      .get(organizationReferencesPath(campaignId, '000000000000000000000001'))
      .expect(404)

    expect(response.body.error.code).toBe('character_not_found')
  })
})
