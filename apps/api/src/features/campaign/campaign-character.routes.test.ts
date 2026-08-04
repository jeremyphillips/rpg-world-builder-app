import type { Agent } from 'supertest'
import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { CampaignCharacterParticipationModel } from '../campaign'
import { CampaignMembershipModel } from '../campaign'
import { createTestCampaign, registerAndLoginTestUser } from '../../test/auth-agent'
import { registerCampaignMember } from '../../test/helpers/campaign-membership'
import {
  seedCharacterParticipation,
  setMembershipControlledPcs,
} from '../../test/helpers/campaign-participation'
import { minimalStandalonePcInput } from '../../test/fixtures/characters'
import { useIntegrationApp } from '../../test/setup/integration-app'

const getApp = useIntegrationApp()
const TEST_PASSWORD = 'supersecret'

async function registerOwner(email: string) {
  return registerAndLoginTestUser(getApp(), {
    email,
    password: TEST_PASSWORD,
    displayName: 'Campaign Owner',
  })
}

async function createCharacter(agent: Agent, csrfToken: string, name = 'Verna'): Promise<string> {
  const response = await agent
    .post('/api/characters')
    .set(CSRF_HEADER, csrfToken)
    .send({ ...minimalStandalonePcInput, name })
    .expect(201)

  return response.body.character.id as string
}

async function seedParticipatingPc({
  campaignId,
  ownerAgent,
  ownerCsrfToken,
  ownerUserId,
  characterName = 'Party PC',
}: {
  campaignId: string
  ownerAgent: Agent
  ownerCsrfToken: string
  ownerUserId: string
  characterName?: string
}): Promise<string> {
  const characterId = await createCharacter(ownerAgent, ownerCsrfToken, characterName)
  await seedCharacterParticipation({ campaignId, characterId })
  await setMembershipControlledPcs({
    campaignId,
    userId: ownerUserId,
    controlledCharacterIds: [characterId],
  })
  return characterId
}

describe('GET /api/campaigns/:campaignId/characters', () => {
  it('returns controlled open-participating PCs for a player', async () => {
    const owner = await registerOwner('campaign-char-list-owner@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Player List Campaign',
    )
    await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
      characterName: 'Owner PC',
    })

    const player = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'campaign-char-list-player@example.com',
      campaignRole: 'pc',
    })
    const playerCharacterId = await createCharacter(player.agent, player.csrfToken, 'Player PC')
    await seedCharacterParticipation({ campaignId, characterId: playerCharacterId })
    await setMembershipControlledPcs({
      campaignId,
      userId: player.userId,
      controlledCharacterIds: [playerCharacterId],
    })

    const response = await player.agent.get(`/api/campaigns/${campaignId}/characters`).expect(200)

    expect(response.body.characters).toHaveLength(1)
    expect(response.body.characters[0]?.character.id).toBe(playerCharacterId)
    expect(response.body.characters[0]?.character.summary).toMatch(/^Dwarf · Level 1 Fighter$/)
    expect(response.body.characters[0]?.controller?.displayName).toBeTruthy()
  })

  it('returns all open-participating PCs with controller null when unassigned for managers', async () => {
    const owner = await registerOwner('campaign-char-list-manager@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Manager List Campaign',
    )
    const unassignedCharacterId = await createCharacter(
      owner.agent,
      owner.csrfToken,
      'Unassigned PC',
    )
    await seedCharacterParticipation({ campaignId, characterId: unassignedCharacterId })

    const assignedCharacterId = await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
      characterName: 'Assigned PC',
    })

    const response = await owner.agent.get(`/api/campaigns/${campaignId}/characters`).expect(200)

    expect(response.body.characters).toHaveLength(2)
    const unassigned = response.body.characters.find(
      (entry: { character: { id: string } }) => entry.character.id === unassignedCharacterId,
    )
    const assigned = response.body.characters.find(
      (entry: { character: { id: string } }) => entry.character.id === assignedCharacterId,
    )
    expect(unassigned?.controller).toBeNull()
    expect(assigned?.controller).not.toBeNull()
  })

  it('returns 403 for an observer', async () => {
    const owner = await registerOwner('campaign-char-list-observer@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Observer List Campaign',
    )
    await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
    })

    const observer = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'campaign-char-list-observer-only@example.com',
      campaignRole: 'observer',
    })

    const response = await observer.agent.get(`/api/campaigns/${campaignId}/characters`).expect(403)

    expect(response.body.error.code).toBe('forbidden')
  })

  it('reflects control removal while open participation remains', async () => {
    const owner = await registerOwner('campaign-char-list-control-removed@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Control Removed List Campaign',
    )
    const characterId = await createCharacter(
      owner.agent,
      owner.csrfToken,
      'Formerly Controlled PC',
    )
    await seedCharacterParticipation({ campaignId, characterId })

    const player = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'campaign-char-list-control-removed-player@example.com',
      campaignRole: 'pc',
    })

    const playerList = await player.agent.get(`/api/campaigns/${campaignId}/characters`).expect(200)
    expect(playerList.body.characters).toHaveLength(0)

    const managerList = await owner.agent.get(`/api/campaigns/${campaignId}/characters`).expect(200)
    expect(managerList.body.characters).toHaveLength(1)
    expect(managerList.body.characters[0]?.controller).toBeNull()
  })

  it('omits stale-control PCs for players while managers still see open roster characters', async () => {
    const owner = await registerOwner('campaign-char-stale-control-owner@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Stale Control Campaign',
    )
    const managerVisibleCharacterId = await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
      characterName: 'Manager Visible PC',
    })

    const player = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'campaign-char-stale-control-player@example.com',
      campaignRole: 'pc',
    })
    const staleCharacterId = await createCharacter(player.agent, player.csrfToken, 'Stale PC')
    await seedCharacterParticipation({ campaignId, characterId: staleCharacterId })
    await setMembershipControlledPcs({
      campaignId,
      userId: player.userId,
      controlledCharacterIds: [staleCharacterId],
    })

    await CampaignCharacterParticipationModel.updateOne(
      { campaignId, characterId: staleCharacterId },
      { $set: { leftAt: new Date() } },
    )
    await CampaignMembershipModel.updateOne(
      { campaignId, userId: player.userId },
      { $set: { controlledCharacterIds: [staleCharacterId] } },
    )

    const playerList = await player.agent.get(`/api/campaigns/${campaignId}/characters`).expect(200)
    expect(playerList.body.characters).toEqual([])

    const playerDetail = await player.agent
      .get(`/api/campaigns/${campaignId}/characters/${staleCharacterId}`)
      .expect(404)
    expect(playerDetail.body.error.code).toBe('character_not_in_campaign')

    const managerList = await owner.agent.get(`/api/campaigns/${campaignId}/characters`).expect(200)
    expect(managerList.body.characters).toHaveLength(1)
    expect(managerList.body.characters[0]?.character.id).toBe(managerVisibleCharacterId)

    const managerDetail = await owner.agent
      .get(`/api/campaigns/${campaignId}/characters/${managerVisibleCharacterId}`)
      .expect(200)
    expect(managerDetail.body.capabilities.canManage).toBe(true)
  })
})

describe('GET /api/campaigns/:campaignId/characters/:characterId', () => {
  it('returns 200 for the campaign manager viewing a peer PC sheet', async () => {
    const owner = await registerOwner('campaign-char-owner@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Sheet Access Campaign',
    )
    await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
    })

    const player = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'campaign-char-player@example.com',
      campaignRole: 'pc',
    })
    const playerCharacterId = await createCharacter(player.agent, player.csrfToken, 'Player PC')
    await seedCharacterParticipation({ campaignId, characterId: playerCharacterId })
    await setMembershipControlledPcs({
      campaignId,
      userId: player.userId,
      controlledCharacterIds: [playerCharacterId],
    })

    const response = await owner.agent
      .get(`/api/campaigns/${campaignId}/characters/${playerCharacterId}`)
      .expect(200)

    expect(response.body.character.id).toBe(playerCharacterId)
    expect(response.body.capabilities).toEqual({
      canEdit: true,
      canManage: true,
      canDelete: false,
    })
    expect(response.body.participation.roster.status).toBe('active')
  })

  it('returns 200 for a peer PC viewing another participating character', async () => {
    const owner = await registerOwner('campaign-char-peer-owner@example.com')
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Peer View Campaign')
    await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
      characterName: 'Owner PC',
    })

    const player = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'campaign-char-peer-player@example.com',
      campaignRole: 'pc',
    })
    const playerCharacterId = await createCharacter(player.agent, player.csrfToken, 'Player PC')
    await seedCharacterParticipation({ campaignId, characterId: playerCharacterId })
    await setMembershipControlledPcs({
      campaignId,
      userId: player.userId,
      controlledCharacterIds: [playerCharacterId],
    })

    const ownerCharacter = await owner.agent.get('/api/characters').expect(200)
    const ownerCharacterId = ownerCharacter.body.characters[0]?.id as string

    const response = await player.agent
      .get(`/api/campaigns/${campaignId}/characters/${ownerCharacterId}`)
      .expect(200)

    expect(response.body.character.id).toBe(ownerCharacterId)
    expect(response.body.capabilities).toEqual({
      canEdit: false,
      canManage: false,
      canDelete: false,
    })
  })

  it('returns 200 for an observer viewing an open-participating PC', async () => {
    const owner = await registerOwner('campaign-char-observer-owner@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Observer View Campaign',
    )
    const characterId = await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
    })

    const observer = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'campaign-char-observer@example.com',
      campaignRole: 'observer',
    })

    const response = await observer.agent
      .get(`/api/campaigns/${campaignId}/characters/${characterId}`)
      .expect(200)

    expect(response.body.character.id).toBe(characterId)
    expect(response.body.capabilities).toEqual({
      canEdit: false,
      canManage: false,
      canDelete: false,
    })
  })

  it('returns 403 for a non-member', async () => {
    const owner = await registerOwner('campaign-char-outsider-owner@example.com')
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Non-member Campaign')
    const characterId = await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
    })

    const outsider = await registerAndLoginTestUser(getApp(), {
      email: 'campaign-char-outsider@example.com',
      password: TEST_PASSWORD,
      displayName: 'Outsider',
    })

    const response = await outsider.agent
      .get(`/api/campaigns/${campaignId}/characters/${characterId}`)
      .expect(403)

    expect(response.body.error.code).toBe('forbidden')
  })

  it('returns 404 when the character is not in the requested campaign', async () => {
    const owner = await registerOwner('campaign-char-wrong-campaign-owner@example.com')
    const campaignA = await createTestCampaign(owner.agent, owner.csrfToken, 'Campaign A')
    const campaignB = await createTestCampaign(owner.agent, owner.csrfToken, 'Campaign B')
    const characterId = await seedParticipatingPc({
      campaignId: campaignA,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
    })

    const response = await owner.agent
      .get(`/api/campaigns/${campaignB}/characters/${characterId}`)
      .expect(404)

    expect(response.body.error.code).toBe('character_not_in_campaign')
  })

  it('returns 404 when participation is closed', async () => {
    const owner = await registerOwner('campaign-char-closed-owner@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Closed Participation',
    )
    const characterId = await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
    })

    await CampaignCharacterParticipationModel.updateOne(
      { campaignId, characterId },
      { $set: { leftAt: new Date() } },
    )

    const response = await owner.agent
      .get(`/api/campaigns/${campaignId}/characters/${characterId}`)
      .expect(404)

    expect(response.body.error.code).toBe('character_not_in_campaign')
  })

  it('returns 200 after control is removed while open participation remains', async () => {
    const owner = await registerOwner('campaign-char-unassigned-owner@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Unassigned PC Campaign',
    )
    const characterId = await createCharacter(owner.agent, owner.csrfToken, 'Unassigned PC')
    await seedCharacterParticipation({ campaignId, characterId })

    const player = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'campaign-char-unassigned-player@example.com',
      campaignRole: 'pc',
    })

    const response = await player.agent
      .get(`/api/campaigns/${campaignId}/characters/${characterId}`)
      .expect(200)

    expect(response.body.character.id).toBe(characterId)
    expect(response.body.capabilities.canEdit).toBe(false)
  })

  it('returns 403 for a former member even when participation remains open', async () => {
    const owner = await registerOwner('campaign-char-former-member-owner@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Former Member Campaign',
    )
    const characterId = await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
    })

    const formerMember = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'campaign-char-former-member@example.com',
      campaignRole: 'observer',
    })

    await CampaignMembershipModel.deleteOne({ campaignId, userId: formerMember.userId })

    const response = await formerMember.agent
      .get(`/api/campaigns/${campaignId}/characters/${characterId}`)
      .expect(403)

    expect(response.body.error.code).toBe('forbidden')
  })
})

describe('GET /api/characters/:characterId/routing-context', () => {
  it('returns openCampaign for the owner with open participation', async () => {
    const owner = await registerOwner('routing-context-owner@example.com')
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Routing Campaign')
    const characterId = await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
    })

    const response = await owner.agent
      .get(`/api/characters/${characterId}/routing-context`)
      .expect(200)

    expect(response.body).toEqual({ openCampaign: { id: campaignId } })
  })

  it('returns an empty object for the owner without open participation', async () => {
    const owner = await registerOwner('routing-context-standalone-owner@example.com')
    const characterId = await createCharacter(owner.agent, owner.csrfToken)

    const response = await owner.agent
      .get(`/api/characters/${characterId}/routing-context`)
      .expect(200)

    expect(response.body).toEqual({})
  })

  it('returns openCampaign for an active campaign member who does not own the character', async () => {
    const owner = await registerOwner('routing-context-member-owner@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Routing Member Campaign',
    )
    const characterId = await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
    })

    const member = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'routing-context-member@example.com',
      campaignRole: 'observer',
    })

    const response = await member.agent
      .get(`/api/characters/${characterId}/routing-context`)
      .expect(200)

    expect(response.body).toEqual({ openCampaign: { id: campaignId } })
  })

  it('returns 404 for a non-owner non-member to avoid leaking campaign metadata', async () => {
    const owner = await registerOwner('routing-context-leak-owner@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Routing Leak Campaign',
    )
    const characterId = await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
    })

    const outsider = await registerAndLoginTestUser(getApp(), {
      email: 'routing-context-outsider@example.com',
      password: TEST_PASSWORD,
      displayName: 'Outsider',
    })

    await outsider.agent.get(`/api/characters/${characterId}/routing-context`).expect(404)
  })

  it('returns 404 for a former member even when participation remains open', async () => {
    const owner = await registerOwner('routing-context-former-owner@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Routing Former Member Campaign',
    )
    const characterId = await seedParticipatingPc({
      campaignId,
      ownerAgent: owner.agent,
      ownerCsrfToken: owner.csrfToken,
      ownerUserId: owner.userId,
    })

    const formerMember = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'routing-context-former-member@example.com',
      campaignRole: 'observer',
    })

    await CampaignMembershipModel.deleteOne({ campaignId, userId: formerMember.userId })

    await formerMember.agent.get(`/api/characters/${characterId}/routing-context`).expect(404)
  })
})
