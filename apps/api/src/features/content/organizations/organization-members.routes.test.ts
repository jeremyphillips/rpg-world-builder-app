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
import { CampaignCharacterParticipationModel } from '../../campaign'
import { CharacterModel, createPcRecord } from '../../character'
import { createHomebrewContent } from '../lib/content-write.service'
import {
  assertContentUsageRegistrationCoverage,
  getContentUsageRegistration,
} from '../lib/content-usage/content-usage-resolvers'
import { organizationWriteConfig } from './organizations.config'
import { resolveOrganizationMembers } from './resolve-organization-members'

const getApp = useIntegrationApp()

useIntegrationDb()

const minimalOrganizationInput = {
  slug: 'iron-circle',
  name: 'Iron Circle',
  organizationKind: 'military',
} as const

const membersPath = (campaignId: string, organizationId: string) =>
  `/api/campaigns/${campaignId}/content/organizations/${organizationId}/members?page=1&pageSize=4`

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

  it('excludes characters whose open participation has closed', async () => {
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
    await setOrganizationConnection(pc.id, organization.id)

    await CampaignCharacterParticipationModel.updateOne(
      { campaignId: campaign.id, characterId: pc.id },
      { $set: { leftAt: new Date() } },
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

  it('sorts untitled members by normalized name then id', async () => {
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

  it('sorts by membership priority descending before name', async () => {
    const campaign = await makeTestCampaign()
    const organization = await createHomebrewContent(organizationWriteConfig, campaign.id, {
      ...minimalOrganizationInput,
      slug: 'priority-circle',
      organizationKind: 'professional',
    })

    const recruit = await createPcRecord(
      { ...minimalStandalonePcInput, name: 'Zed Recruit' },
      campaign.owner.id,
    )
    const master = await createPcRecord(
      { ...minimalStandalonePcInput, name: 'Ann Master' },
      campaign.owner.id,
    )

    await Promise.all([
      attachCharacterToCampaign({
        campaignId: campaign.id,
        characterId: recruit.id,
        joinedAt: new Date().toISOString(),
      }),
      attachCharacterToCampaign({
        campaignId: campaign.id,
        characterId: master.id,
        joinedAt: new Date().toISOString(),
      }),
      CharacterModel.collection.updateOne(
        { _id: new Types.ObjectId(recruit.id) },
        {
          $set: {
            connections: {
              organizations: [
                { organizationId: organization.id, title: 'Apprentice', priority: 10 },
              ],
            },
          },
        },
      ),
      CharacterModel.collection.updateOne(
        { _id: new Types.ObjectId(master.id) },
        {
          $set: {
            connections: {
              organizations: [
                { organizationId: organization.id, title: 'Guildmaster', priority: 50 },
              ],
            },
          },
        },
      ),
    ])

    const result = await resolveOrganizationMembers({
      campaignId: campaign.id,
      organizationId: organization.id,
      page: 1,
      pageSize: 4,
    })

    expect(result?.items.map((entry) => entry.character.name)).toEqual([
      'Ann Master',
      'Zed Recruit',
    ])
    expect(result?.items.map((entry) => entry.membership)).toEqual([
      { title: 'Guildmaster', priority: 50 },
      { title: 'Apprentice', priority: 10 },
    ])
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
          membership: {},
        }),
      ],
      total: 1,
    })
  })

  it('matches the organization character reference descriptor via usage registration', () => {
    expect(() => assertContentUsageRegistrationCoverage()).not.toThrow()
    expect(
      getContentUsageRegistration('organizations').sources.some((source) => source.entry),
    ).toBe(true)
  })
})

describe('organization members routes', () => {
  it('requires authentication', async () => {
    await request(getApp())
      .get(
        '/api/campaigns/000000000000000000000000/content/organizations/000000000000000000000001/members',
      )
      .expect(401)
  })

  it('returns members for authenticated campaign users', async () => {
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
      .get(membersPath(campaignId, organizationId))
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(res.body).toEqual({
      items: [
        expect.objectContaining({
          characterType: 'npc',
          character: expect.objectContaining({ id: npc.id, name: 'Route Envoy' }),
          membership: {},
        }),
      ],
      total: 1,
    })
  })

  it('lists an NPC created atomically with an organization membership connection (Quick NPC)', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createOrgRes = await agent
      .post(`/api/campaigns/${campaignId}/content/organizations`)
      .set(CSRF_HEADER, csrfToken)
      .send({ ...minimalOrganizationInput, organizationKind: 'professional' })
      .expect(201)

    const organizationId = createOrgRes.body.organizations.id as string

    // One POST carries the membership in connections — no follow-up mutation.
    await agent
      .post(`/api/campaigns/${campaignId}/npcs`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        ...minimalNpcRequestInput,
        name: 'Quick Envoy',
        connections: {
          organizations: [{ organizationId, title: 'Guildmaster', priority: 50 }],
          locations: [],
        },
      })
      .expect(201)

    const membersRes = await agent
      .get(membersPath(campaignId, organizationId))
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(membersRes.body).toEqual({
      items: [
        expect.objectContaining({
          characterType: 'npc',
          character: expect.objectContaining({ name: 'Quick Envoy' }),
          membership: { title: 'Guildmaster', priority: 50 },
        }),
      ],
      total: 1,
    })
  })

  it('returns 404 for a missing organization in the campaign', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    await agent
      .get(membersPath(campaignId, '000000000000000000000000'))
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
      .get(membersPath(otherCampaignId, organizationId))
      .set(CSRF_HEADER, other.csrfToken)
      .expect(404)
  })

  it('denies campaign outsiders', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'connected-owner@example.com',
      password: 'supersecret',
      displayName: 'Owner',
    })
    const outsider = await registerAndLoginTestUser(getApp(), {
      email: 'connected-outsider@example.com',
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
      .get(membersPath(campaignId, organizationId))
      .set(CSRF_HEADER, outsider.csrfToken)
      .expect(403)
  })

  it('allows observer campaign roles to read members', async () => {
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
      email: 'observer-user@example.com',
      campaignRole: 'observer',
    })

    await observer.agent
      .get(membersPath(campaignId, organizationId))
      .set(CSRF_HEADER, observer.csrfToken)
      .expect(200)
  })
})
