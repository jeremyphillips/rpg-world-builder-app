import { beforeAll, describe, expect, it } from 'vitest'

import { createTestCampaign, registerAndLoginTestUser } from '../../test/auth-agent'
import { useIntegrationApp } from '../../test/setup/integration-app'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { createCampaignNpc } from '../campaign'
import { createHomebrewContent, locationWriteConfig, organizationWriteConfig } from '../content'
import { minimalNpcRequestInput } from '../../test/fixtures/npcs'
import {
  createCharacterRelationshipRecordCommand,
  deleteCharacterRelationshipRecordCommand,
  updateCharacterRelationshipRecordCommand,
} from './character-relationship-mutation'
import { findCharacterRelationshipById } from './character-relationship.repository'
import { CharacterRelationshipModel } from './character-relationship.model'

const getApp = useIntegrationApp()
useIntegrationDb()

beforeAll(async () => {
  await CharacterRelationshipModel.syncIndexes()
})

const minimalOrganizationInput = {
  slug: 'silver-guard',
  name: 'Silver Guard',
  organizationDomain: 'military',
} as const

describe('character relationship services', () => {
  it('creates, updates, and deletes organization membership edges with revision checks', async () => {
    const { agent, csrfToken, userId } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaignId,
      minimalOrganizationInput,
    )
    const { character: npc } = await createCampaignNpc(campaignId, userId, {
      ...minimalNpcRequestInput,
      name: 'Aldric Vale',
    })

    const created = await createCharacterRelationshipRecordCommand({
      campaignId,
      actorUserId: userId,
      command: {
        idempotencyKey: 'membership-create-1',
        relationship: {
          kind: 'organizationMembership',
          characterId: npc.id,
          organizationId: organization.id,
          details: { lifecycle: 'current', title: 'Captain' },
        },
      },
    })

    expect(created).toMatchObject({
      kind: 'organizationMembership',
      characterId: npc.id,
      organizationId: organization.id,
      revision: 1,
      details: { lifecycle: 'current', title: 'Captain' },
    })

    const replayed = await createCharacterRelationshipRecordCommand({
      campaignId,
      actorUserId: userId,
      command: {
        idempotencyKey: 'membership-create-1',
        relationship: {
          kind: 'organizationMembership',
          characterId: npc.id,
          organizationId: organization.id,
          details: { lifecycle: 'current', title: 'Captain' },
        },
      },
    })
    expect(replayed.id).toBe(created.id)

    const updated = await updateCharacterRelationshipRecordCommand({
      campaignId,
      relationshipId: created.id,
      body: {
        expectedRevision: 1,
        details: { title: 'Commander' },
      },
    })
    expect(updated.revision).toBe(2)
    expect(updated.details).toMatchObject({ title: 'Commander' })

    await deleteCharacterRelationshipRecordCommand({
      campaignId,
      relationshipId: created.id,
      body: { expectedRevision: 2 },
    })

    expect(await findCharacterRelationshipById(campaignId, created.id)).toBeNull()
  })

  it('rejects duplicate canonical edges', async () => {
    const { agent, csrfToken, userId } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaignId,
      minimalOrganizationInput,
    )
    const { character: npc } = await createCampaignNpc(campaignId, userId, {
      ...minimalNpcRequestInput,
      name: 'Duplicate Edge',
    })

    await createCharacterRelationshipRecordCommand({
      campaignId,
      actorUserId: userId,
      command: {
        idempotencyKey: 'membership-create-a',
        relationship: {
          kind: 'organizationMembership',
          characterId: npc.id,
          organizationId: organization.id,
        },
      },
    })

    await expect(
      createCharacterRelationshipRecordCommand({
        campaignId,
        actorUserId: userId,
        command: {
          idempotencyKey: 'membership-create-b',
          relationship: {
            kind: 'organizationMembership',
            characterId: npc.id,
            organizationId: organization.id,
          },
        },
      }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('rejects idempotency key reuse with a different payload', async () => {
    const { agent, csrfToken, userId } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaignId,
      minimalOrganizationInput,
    )
    const { character: npc } = await createCampaignNpc(campaignId, userId, {
      ...minimalNpcRequestInput,
      name: 'Idempotency Mismatch',
    })

    await createCharacterRelationshipRecordCommand({
      campaignId,
      actorUserId: userId,
      command: {
        idempotencyKey: 'membership-create-reuse',
        relationship: {
          kind: 'organizationMembership',
          characterId: npc.id,
          organizationId: organization.id,
          details: { lifecycle: 'current', title: 'Captain' },
        },
      },
    })

    await expect(
      createCharacterRelationshipRecordCommand({
        campaignId,
        actorUserId: userId,
        command: {
          idempotencyKey: 'membership-create-reuse',
          relationship: {
            kind: 'organizationMembership',
            characterId: npc.id,
            organizationId: organization.id,
            details: { lifecycle: 'current', title: 'Commander' },
          },
        },
      }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('rejects stale revision updates', async () => {
    const { agent, csrfToken, userId } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaignId,
      minimalOrganizationInput,
    )
    const { character: npc } = await createCampaignNpc(campaignId, userId, {
      ...minimalNpcRequestInput,
      name: 'Stale Revision',
    })

    const created = await createCharacterRelationshipRecordCommand({
      campaignId,
      actorUserId: userId,
      command: {
        idempotencyKey: 'membership-stale',
        relationship: {
          kind: 'organizationMembership',
          characterId: npc.id,
          organizationId: organization.id,
        },
      },
    })

    await expect(
      updateCharacterRelationshipRecordCommand({
        campaignId,
        relationshipId: created.id,
        body: { expectedRevision: 0, details: { title: 'Outdated' } },
      }),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('switches primary residence to a single current primary edge', async () => {
    const { agent, csrfToken, userId } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const world = await createHomebrewContent(locationWriteConfig, campaignId, {
      slug: 'residence-world',
      kind: 'world',
      name: 'Residence World',
    })
    const region = await createHomebrewContent(locationWriteConfig, campaignId, {
      slug: 'residence-region',
      kind: 'region',
      name: 'Residence Region',
      parentLocationId: world.id,
    })
    const settlement = await createHomebrewContent(locationWriteConfig, campaignId, {
      slug: 'residence-settlement',
      kind: 'settlement',
      name: 'Residence Settlement',
      parentLocationId: region.id,
    })
    const harborford = await createHomebrewContent(locationWriteConfig, campaignId, {
      slug: 'harborford',
      name: 'Harborford House',
      kind: 'structure',
      structureType: 'building',
      parentLocationId: settlement.id,
    })
    const greyshore = await createHomebrewContent(locationWriteConfig, campaignId, {
      slug: 'greyshore',
      name: 'Greyshore House',
      kind: 'structure',
      structureType: 'building',
      parentLocationId: settlement.id,
    })
    const { character: npc } = await createCampaignNpc(campaignId, userId, {
      ...minimalNpcRequestInput,
      name: 'Resident',
    })

    const firstResidence = await createCharacterRelationshipRecordCommand({
      campaignId,
      actorUserId: userId,
      command: {
        idempotencyKey: 'residence-a',
        relationship: {
          kind: 'resides_at',
          characterId: npc.id,
          locationId: harborford.id,
          details: { lifecycle: 'current', isPrimary: true },
        },
      },
    })
    const secondResidence = await createCharacterRelationshipRecordCommand({
      campaignId,
      actorUserId: userId,
      command: {
        idempotencyKey: 'residence-b',
        relationship: {
          kind: 'resides_at',
          characterId: npc.id,
          locationId: greyshore.id,
          details: { lifecycle: 'current', isPrimary: false },
        },
      },
    })

    await updateCharacterRelationshipRecordCommand({
      campaignId,
      relationshipId: secondResidence.id,
      body: { expectedRevision: 1, details: { isPrimary: true } },
    })

    const refreshedFirst = await findCharacterRelationshipById(campaignId, firstResidence.id)
    const refreshedSecond = await findCharacterRelationshipById(campaignId, secondResidence.id)

    expect(refreshedFirst?.details).toMatchObject({ isPrimary: false })
    expect(refreshedSecond?.details).toMatchObject({ isPrimary: true })
  })
})
