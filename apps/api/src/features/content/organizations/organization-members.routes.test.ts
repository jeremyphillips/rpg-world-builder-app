import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { Types } from 'mongoose'

import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { registerCampaignMember } from '../../../test/helpers/campaign-membership'
import { minimalStandalonePcInput } from '../../../test/fixtures/characters'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationApp } from '../../../test/setup/integration-app'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { attachCharacterToCampaign, createCampaignNpc } from '../../campaign'
import { CharacterModel, createPcRecord } from '../../character'
import { getContentCharacterUsageMatcher } from '../lib/content-character-usage/content-character-usage-matchers'
import { createHomebrewContent } from '../lib/content-write.service'
import { organizationWriteConfig } from './organizations.config'
import { resolveOrganizationMembers } from './resolve-organization-members'

const getApp = useIntegrationApp()

useIntegrationDb()

const minimalOrganizationInput = {
  slug: 'iron-circle',
  name: 'Iron Circle',
  organizationKind: 'military',
} as const

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

describe('resolveOrganizationMembers', () => {
  it('returns PC and NPC hits with pagination totals', async () => {
    const campaign = await makeTestCampaign()
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaign.id,
      minimalOrganizationInput,
    )
    const pc = await createPcRecord(minimalStandalonePcInput, campaign.owner.id)
    await attachCharacterToCampaign({
      campaignId: campaign.id,
      characterId: pc.id,
      joinedAt: new Date().toISOString(),
    })
    const { character: npc } = await createCampaignNpc(campaign.id, {
      ...minimalNpcRequestInput,
      name: 'Circle Envoy',
    })

    await Promise.all([
      setOrganizationConnection(pc.id, organization.id),
      setOrganizationConnection(npc.id, organization.id),
    ])

    const pageOne = await resolveOrganizationMembers({
      campaignId: campaign.id,
      organizationId: organization.id,
      page: 1,
      pageSize: 1,
    })
    expect(pageOne).toEqual({
      items: [
        expect.objectContaining({
          characterType: expect.stringMatching(/^(pc|npc)$/),
          character: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            summary: expect.any(String),
          }),
        }),
      ],
      total: 2,
    })

    const pageTwo = await resolveOrganizationMembers({
      campaignId: campaign.id,
      organizationId: organization.id,
      page: 2,
      pageSize: 1,
    })
    expect(pageTwo?.items).toHaveLength(1)
    expect(pageTwo?.total).toBe(2)
  })

  it('returns an empty page when no characters reference the organization', async () => {
    const campaign = await makeTestCampaign()
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaign.id,
      minimalOrganizationInput,
    )

    await expect(
      resolveOrganizationMembers({
        campaignId: campaign.id,
        organizationId: organization.id,
        page: 1,
        pageSize: 4,
      }),
    ).resolves.toEqual({ items: [], total: 0 })
  })

  it('returns null when the organization is not in the campaign catalog', async () => {
    const campaign = await makeTestCampaign()

    await expect(
      resolveOrganizationMembers({
        campaignId: campaign.id,
        organizationId: '000000000000000000000000',
        page: 1,
        pageSize: 4,
      }),
    ).resolves.toBeNull()
  })

  it('sorts by normalized name then id', async () => {
    const campaign = await makeTestCampaign()
    const organization = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      ...minimalOrganizationInput,
      slug: 'sorted-circle',
    })

    const alpha = await createPcRecord(
      { ...minimalStandalonePcInput, name: 'alpha' },
      campaign.owner.id,
    )
    const beta = await createPcRecord(
      { ...minimalStandalonePcInput, name: 'Beta' },
      campaign.owner.id,
    )

    await Promise.all([
      attachCharacterToCampaign({
        campaignId: campaign.id,
        characterId: alpha.id,
        joinedAt: new Date().toISOString(),
      }),
      attachCharacterToCampaign({
        campaignId: campaign.id,
        characterId: beta.id,
        joinedAt: new Date().toISOString(),
      }),
      setOrganizationConnection(alpha.id, organization.id),
      setOrganizationConnection(beta.id, organization.id),
    ])

    const result = await resolveOrganizationMembers({
      campaignId: campaign.id,
      organizationId: organization.id,
      page: 1,
      pageSize: 4,
    })

    expect(result?.items.map((entry) => entry.character.name)).toEqual(['alpha', 'Beta'])
  })

  it('includes characters referencing a draft organization excluded from discovery', async () => {
    const campaign = await makeTestCampaign()
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaign.id,
      {
        slug: 'draft-circle',
        name: 'Draft Circle',
        organizationKind: 'other',
      },
      { status: 'draft' },
    )
    const { character: npc } = await createCampaignNpc(campaign.id, {
      ...minimalNpcRequestInput,
      name: 'Draft Ties',
    })
    await setOrganizationConnection(npc.id, organization.id)

    await expect(
      resolveOrganizationMembers({
        campaignId: campaign.id,
        organizationId: organization.id,
        page: 1,
        pageSize: 4,
      }),
    ).resolves.toEqual({
      items: [
        expect.objectContaining({
          characterType: 'npc',
          character: expect.objectContaining({ id: npc.id, name: 'Draft Ties' }),
        }),
      ],
      total: 1,
    })
  })

  it('matches the organization usage matcher fragment', async () => {
    const organizationId = '000000000000000000000001'
    expect(getContentCharacterUsageMatcher('organizations', organizationId, 'ignored')).toEqual({
      'connections.organizations.organizationId': organizationId,
    })
  })
})

describe('organization connected characters routes', () => {
  it('requires authentication', async () => {
    await request(getApp())
      .get(
        '/api/campaigns/000000000000000000000000/content/organizations/000000000000000000000001/members',
      )
      .expect(401)
  })

  it('returns connected characters for campaign members', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/content/organizations`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalOrganizationInput)
      .expect(201)

    const organizationId = createRes.body.organizations.id as string
    const { character: npc } = await createCampaignNpc(campaignId, {
      ...minimalNpcRequestInput,
      name: 'Route Envoy',
    })
    await setOrganizationConnection(npc.id, organizationId)

    const res = await agent
      .get(
        `/api/campaigns/${campaignId}/content/organizations/${organizationId}/members?page=1&pageSize=4`,
      )
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(res.body).toEqual({
      items: [
        expect.objectContaining({
          characterType: 'npc',
          character: expect.objectContaining({ id: npc.id, name: 'Route Envoy' }),
        }),
      ],
      total: 1,
    })
  })

  it('returns 404 for a missing organization in the campaign', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    await agent
      .get(
        `/api/campaigns/${campaignId}/content/organizations/000000000000000000000000/members?page=1&pageSize=4`,
      )
      .set(CSRF_HEADER, csrfToken)
      .expect(404)
  })

  it('returns 404 when the organization id belongs to another campaign', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'org-owner@example.com',
      password: 'supersecret',
      displayName: 'Owner',
    })
    const other = await registerAndLoginTestUser(getApp(), {
      email: 'org-other@example.com',
      password: 'supersecret',
      displayName: 'Other',
    })
    const ownerCampaignId = await createTestCampaign(owner.agent, owner.csrfToken)
    const otherCampaignId = await createTestCampaign(other.agent, other.csrfToken)

    const createRes = await owner.agent
      .post(`/api/campaigns/${ownerCampaignId}/content/organizations`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send(minimalOrganizationInput)
      .expect(201)

    const organizationId = createRes.body.organizations.id as string

    await other.agent
      .get(
        `/api/campaigns/${otherCampaignId}/content/organizations/${organizationId}/members?page=1&pageSize=4`,
      )
      .set(CSRF_HEADER, other.csrfToken)
      .expect(404)
  })

  it('denies unauthenticated campaign outsiders', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'members-owner@example.com',
      password: 'supersecret',
      displayName: 'Owner',
    })
    const outsider = await registerAndLoginTestUser(getApp(), {
      email: 'members-outsider@example.com',
      password: 'supersecret',
      displayName: 'Outsider',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken)

    const createRes = await owner.agent
      .post(`/api/campaigns/${campaignId}/content/organizations`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send(minimalOrganizationInput)
      .expect(201)

    const organizationId = createRes.body.organizations.id as string

    await outsider.agent
      .get(
        `/api/campaigns/${campaignId}/content/organizations/${organizationId}/members?page=1&pageSize=4`,
      )
      .set(CSRF_HEADER, outsider.csrfToken)
      .expect(403)
  })

  it('allows observer campaign members to read connected characters', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'observer-owner@example.com',
      password: 'supersecret',
      displayName: 'Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken)

    const createRes = await owner.agent
      .post(`/api/campaigns/${campaignId}/content/organizations`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send(minimalOrganizationInput)
      .expect(201)

    const organizationId = createRes.body.organizations.id as string
    const observer = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'observer-member@example.com',
      campaignRole: 'observer',
    })

    await observer.agent
      .get(
        `/api/campaigns/${campaignId}/content/organizations/${organizationId}/members?page=1&pageSize=4`,
      )
      .set(CSRF_HEADER, observer.csrfToken)
      .expect(200)
  })
})
