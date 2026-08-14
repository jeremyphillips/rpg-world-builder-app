import { afterEach, describe, expect, it, vi } from 'vitest'

import { buildingCreateCompositionResponseSchema } from '@rpg/contracts'

import { CSRF_HEADER } from '../../../lib/cookies'
import { setMongoTransactionsEnabled } from '../../../lib/mongo-transaction'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { useIntegrationApp } from '../../../test/setup/integration-app'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createHomebrewContent } from '../lib/content-write.service'
import { HomebrewOrganizationModel } from '../organizations/homebrew-organization.model'
import { organizationWriteConfig } from '../organizations/organizations.config'
import { HomebrewLocationModel } from './homebrew-location.model'
import { locationWriteConfig } from './locations.config'

const getApp = useIntegrationApp()

useIntegrationDb()

afterEach(() => {
  vi.restoreAllMocks()
  setMongoTransactionsEnabled(true)
})

async function seedBuildingParent(campaignId: string) {
  const world = await createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'composition-world',
    kind: 'world',
    name: 'Composition World',
  })
  const region = await createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'composition-region',
    kind: 'region',
    name: 'Composition Region',
    parentLocationId: world.id,
  })
  const settlement = await createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'composition-settlement',
    kind: 'settlement',
    name: 'Composition Settlement',
    parentLocationId: region.id,
  })
  return createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'composition-district',
    kind: 'district',
    name: 'Composition District',
    parentLocationId: settlement.id,
  })
}

function buildingInput(parentLocationId: string) {
  return {
    slug: 'guildhall',
    name: 'Guildhall',
    kind: 'structure' as const,
    structureType: 'building' as const,
    parentLocationId,
  }
}

function newOrganization(organizationDraftId: string, slug: string, name: string) {
  return {
    organizationDraftId,
    status: 'published' as const,
    input: {
      slug,
      name,
      organizationDomain: 'commercial' as const,
      activities: [],
      connections: { locations: [] },
    },
  }
}

function path(campaignId: string) {
  return `/api/campaigns/${campaignId}/content/locations/building-compositions`
}

describe('Building create composition route', () => {
  it('atomically creates a Building, new Organization, and existing/new relationships', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const district = await seedBuildingParent(campaignId)
    const existing = await createHomebrewContent(organizationWriteConfig, campaignId, {
      slug: 'masons',
      name: 'Masons',
      organizationDomain: 'commercial',
    })

    const response = await agent
      .post(path(campaignId))
      .set(CSRF_HEADER, csrfToken)
      .send({
        building: { status: 'published', input: buildingInput(district.id) },
        organizations: [newOrganization('org-draft', 'stewards', 'Stewards')],
        relationships: [
          {
            relationshipDraftId: 'relationship-existing',
            kind: 'owns',
            organization: { kind: 'existing', organizationId: existing.id },
          },
          {
            relationshipDraftId: 'relationship-new',
            kind: 'operator',
            organization: { kind: 'new', organizationDraftId: 'org-draft' },
          },
        ],
      })
      .expect(201)

    const parsed = buildingCreateCompositionResponseSchema.parse(response.body)
    expect(parsed.organizations[0]).toMatchObject({ organizationDraftId: 'org-draft' })
    expect(parsed.relationships.map((row) => row.relationshipDraftId)).toEqual([
      'relationship-existing',
      'relationship-new',
    ])

    const organizations = await HomebrewOrganizationModel.find({ campaignId }).lean()
    expect(organizations).toHaveLength(2)
    expect(
      organizations.flatMap((organization) => organization.connections?.locations ?? []),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ locationId: parsed.building.id, kind: 'owns' }),
        expect.objectContaining({ locationId: parsed.building.id, kind: 'operator' }),
      ]),
    )
  })

  it('returns attributed preflight issues and performs no writes for an invalid plan', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const district = await seedBuildingParent(campaignId)
    const locationCount = await HomebrewLocationModel.countDocuments({ campaignId })

    const response = await agent
      .post(path(campaignId))
      .set(CSRF_HEADER, csrfToken)
      .send({
        building: { status: 'published', input: buildingInput(district.id) },
        organizations: [
          newOrganization('org-one', 'duplicate-org', 'First'),
          newOrganization('org-two', 'duplicate-org', 'Second'),
        ],
        relationships: [
          {
            relationshipDraftId: 'missing-org',
            kind: 'owns',
            organization: { kind: 'existing', organizationId: '000000000000000000000001' },
          },
          {
            relationshipDraftId: 'pending-owner',
            kind: 'owns',
            organization: { kind: 'new', organizationDraftId: 'org-one' },
          },
          {
            relationshipDraftId: 'pending-owner-duplicate',
            kind: 'owns',
            organization: { kind: 'new', organizationDraftId: 'org-one' },
          },
        ],
      })
      .expect(422)

    expect(response.body.error.details.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: 'organization', organizationDraftId: 'org-two' }),
        expect.objectContaining({ target: 'relationship', relationshipDraftId: 'missing-org' }),
        expect.objectContaining({
          target: 'relationship',
          relationshipDraftId: 'pending-owner-duplicate',
          code: 'relationship_conflict',
        }),
      ]),
    )
    expect(await HomebrewLocationModel.countDocuments({ campaignId })).toBe(locationCount)
    expect(await HomebrewOrganizationModel.countDocuments({ campaignId })).toBe(0)
  })

  it('creates a Building-only plan without transactions', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const district = await seedBuildingParent(campaignId)
    const locationCount = await HomebrewLocationModel.countDocuments({ campaignId })
    setMongoTransactionsEnabled(false)

    const response = await agent
      .post(path(campaignId))
      .set(CSRF_HEADER, csrfToken)
      .send({
        building: { status: 'published', input: buildingInput(district.id) },
        organizations: [],
        relationships: [],
      })
      .expect(201)

    const parsed = buildingCreateCompositionResponseSchema.parse(response.body)
    expect(parsed.building).toMatchObject({ name: 'Guildhall' })
    expect(parsed.organizations).toEqual([])
    expect(parsed.relationships).toEqual([])
    expect(await HomebrewLocationModel.countDocuments({ campaignId })).toBe(locationCount + 1)
    expect(await HomebrewOrganizationModel.countDocuments({ campaignId })).toBe(0)
  })

  it('fails with a structured capability issue before mutation when composite plans need transactions', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const district = await seedBuildingParent(campaignId)
    const locationCount = await HomebrewLocationModel.countDocuments({ campaignId })
    setMongoTransactionsEnabled(false)

    const response = await agent
      .post(path(campaignId))
      .set(CSRF_HEADER, csrfToken)
      .send({
        building: { status: 'published', input: buildingInput(district.id) },
        organizations: [newOrganization('org-draft', 'stewards', 'Stewards')],
        relationships: [
          {
            relationshipDraftId: 'relationship-new',
            kind: 'operator',
            organization: { kind: 'new', organizationDraftId: 'org-draft' },
          },
        ],
      })
      .expect(503)

    expect(response.body.error).toMatchObject({
      code: 'transactions_unavailable',
      details: { issues: [{ target: 'capability', code: 'transactions_unavailable' }] },
    })
    expect(await HomebrewLocationModel.countDocuments({ campaignId })).toBe(locationCount)
    expect(await HomebrewOrganizationModel.countDocuments({ campaignId })).toBe(0)
  })

  it('aborts Building and Organization writes when relationship persistence fails', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const district = await seedBuildingParent(campaignId)
    const locationCount = await HomebrewLocationModel.countDocuments({ campaignId })
    vi.spyOn(HomebrewOrganizationModel, 'updateOne').mockRejectedValueOnce(
      new Error('injected relationship persistence failure'),
    )

    await agent
      .post(path(campaignId))
      .set(CSRF_HEADER, csrfToken)
      .send({
        building: { status: 'published', input: buildingInput(district.id) },
        organizations: [newOrganization('org-draft', 'keepers', 'Keepers')],
        relationships: [
          {
            relationshipDraftId: 'relationship-new',
            kind: 'operator',
            organization: { kind: 'new', organizationDraftId: 'org-draft' },
          },
        ],
      })
      .expect(500)

    expect(await HomebrewLocationModel.countDocuments({ campaignId })).toBe(locationCount)
    expect(await HomebrewOrganizationModel.countDocuments({ campaignId })).toBe(0)
  })
})
