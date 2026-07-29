import { describe, expect, it } from 'vitest'

import { makeTestUser } from '../../../test/fixtures/users'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createCampaign } from '../campaign.service'
import { createPcRecord } from '../../character/character.repository'
import { minimalStandalonePcInput } from '../../../test/fixtures/characters'
import { CampaignMembershipModel } from '../campaign-membership.model'
import { CampaignCharacterParticipationModel } from './campaign-character-participation.model'
import {
  attachCharacterToCampaign,
  resolveOpenControlledPcCharacterIds,
} from './campaign-character-participation.repository'

useIntegrationDb()

describe('resolveOpenControlledPcCharacterIds', () => {
  it.each([
    {
      name: 'dedupes duplicate control ids',
      controlledCharacterIds: (characterId: string) => [characterId, characterId],
      participation: 'open' as const,
      expectedCount: 1,
    },
    {
      name: 'excludes closed participation',
      controlledCharacterIds: (characterId: string) => [characterId],
      participation: 'closed' as const,
      expectedCount: 0,
    },
    {
      name: 'excludes open participation without control assignment',
      controlledCharacterIds: () => [] as string[],
      participation: 'open' as const,
      expectedCount: 0,
    },
  ])('$name', async ({ controlledCharacterIds, participation, expectedCount }) => {
    const owner = await makeTestUser({ email: `open-control-${participation}@example.com` })
    const { campaign } = await createCampaign({ name: 'Resolver Campaign', createdBy: owner.id })
    const character = await createPcRecord(minimalStandalonePcInput, owner.id)

    await attachCharacterToCampaign({
      campaignId: campaign.id,
      characterId: character.id,
      joinedAt: new Date().toISOString(),
    })

    if (participation === 'closed') {
      await CampaignCharacterParticipationModel.updateOne(
        { campaignId: campaign.id, characterId: character.id },
        { $set: { leftAt: new Date() } },
      )
    }

    const ids = controlledCharacterIds(character.id)
    if (ids.length > 0) {
      await CampaignMembershipModel.updateOne(
        { campaignId: campaign.id, userId: owner.id },
        { $set: { controlledCharacterIds: ids } },
      )
    }

    const resolved = await resolveOpenControlledPcCharacterIds(campaign.id, ids)
    expect(resolved).toHaveLength(expectedCount)
    if (expectedCount === 1) {
      expect(resolved).toEqual([character.id])
    }
  })

  it('excludes missing character ids that are not in open participation', async () => {
    const owner = await makeTestUser({ email: 'open-control-missing@example.com' })
    const { campaign } = await createCampaign({
      name: 'Missing Character Campaign',
      createdBy: owner.id,
    })

    const resolved = await resolveOpenControlledPcCharacterIds(campaign.id, [
      '507f1f77bcf86cd799439011',
    ])

    expect(resolved).toEqual([])
  })

  it('returns only controlled ids with open participation when membership holds mixed ids', async () => {
    const owner = await makeTestUser({ email: 'open-control-mixed@example.com' })
    const player = await makeTestUser({ email: 'open-control-mixed-player@example.com' })
    const { campaign } = await createCampaign({
      name: 'Mixed Control Campaign',
      createdBy: owner.id,
    })

    await CampaignMembershipModel.create({
      campaignId: campaign.id,
      userId: player.id,
      campaignRole: 'pc',
      controlledCharacterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    const openCharacter = await createPcRecord(minimalStandalonePcInput, player.id)
    const closedCharacter = await createPcRecord(
      { ...minimalStandalonePcInput, name: 'Closed PC' },
      player.id,
    )

    await attachCharacterToCampaign({
      campaignId: campaign.id,
      characterId: openCharacter.id,
      joinedAt: new Date().toISOString(),
    })
    await attachCharacterToCampaign({
      campaignId: campaign.id,
      characterId: closedCharacter.id,
      joinedAt: new Date().toISOString(),
    })
    await CampaignCharacterParticipationModel.updateOne(
      { campaignId: campaign.id, characterId: closedCharacter.id },
      { $set: { leftAt: new Date() } },
    )

    await CampaignMembershipModel.updateOne(
      { campaignId: campaign.id, userId: player.id },
      {
        $set: {
          controlledCharacterIds: [openCharacter.id, closedCharacter.id],
        },
      },
    )

    const resolved = await resolveOpenControlledPcCharacterIds(campaign.id, [
      openCharacter.id,
      closedCharacter.id,
    ])

    expect(resolved).toEqual([openCharacter.id])
  })
})
