import { beforeAll, describe, expect, it } from 'vitest'

import { createTestCampaign, registerAndLoginTestUser } from '../../test/auth-agent'
import { useIntegrationApp } from '../../test/setup/integration-app'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { createCampaignNpc } from '../campaign'
import { createHomebrewContent, organizationWriteConfig } from '../content'
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
    const { character: npc } = await createCampaignNpc(campaignId, {
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
    const { character: npc } = await createCampaignNpc(campaignId, {
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
})
