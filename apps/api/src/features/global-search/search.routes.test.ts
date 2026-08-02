import type { Agent } from 'supertest'
import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'
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
    displayName: 'Search Catalog Owner',
  })
}

async function createCharacter(agent: Agent, csrfToken: string, name: string): Promise<string> {
  const response = await agent
    .post('/api/characters')
    .set(CSRF_HEADER, csrfToken)
    .send({ ...minimalStandalonePcInput, name })
    .expect(201)

  return response.body.character.id as string
}

describe('GET /api/campaigns/:campaignId/search/catalog', () => {
  it('returns a campaign-scoped catalog snapshot with all filter groups', async () => {
    const owner = await registerOwner('search-catalog-owner@example.com')
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Search Campaign')

    const characterId = await createCharacter(owner.agent, owner.csrfToken, 'Indexed PC')
    await seedCharacterParticipation({ campaignId, characterId })
    await setMembershipControlledPcs({
      campaignId,
      userId: owner.userId,
      controlledCharacterIds: [characterId],
    })

    const response = await owner.agent
      .get(`/api/campaigns/${campaignId}/search/catalog`)
      .set(CSRF_HEADER, owner.csrfToken)
      .expect(200)

    expect(response.body.scope).toEqual({ kind: 'campaign', campaignId })
    expect(Array.isArray(response.body.documents)).toBe(true)
    expect(response.body.documents.length).toBeGreaterThan(0)

    const filterGroups = new Set(
      response.body.documents.map((document: { filterGroup: string }) => document.filterGroup),
    )
    expect(filterGroups.has('content')).toBe(true)
    expect(filterGroups.has('game-terms')).toBe(true)
    expect(filterGroups.has('characters')).toBe(true)

    const spell = response.body.documents.find(
      (document: { target: { kind: string } }) => document.target.kind === 'spell',
    )
    expect(spell).toMatchObject({
      filterGroup: 'content',
      typeLabel: 'Spell',
      title: expect.any(String),
      secondary: expect.any(String),
      fields: expect.arrayContaining([
        expect.objectContaining({ role: 'label', text: expect.any(String) }),
      ]),
      target: { kind: 'spell', id: expect.any(String) },
    })
    expect(spell).not.toHaveProperty('href')

    const gameTerm = response.body.documents.find(
      (document: { filterGroup: string }) => document.filterGroup === 'game-terms',
    )
    expect(gameTerm).toMatchObject({
      typeLabel: 'Game Term',
      target: {
        kind: 'game-term',
        setId: expect.any(String),
        termId: expect.any(String),
      },
    })

    const pc = response.body.documents.find(
      (document: { target: { kind: string; characterType?: string; id: string } }) =>
        document.target.kind === 'character' &&
        document.target.characterType === 'pc' &&
        document.target.id === characterId,
    )
    expect(pc).toMatchObject({
      filterGroup: 'characters',
      typeLabel: 'Character',
      title: 'Indexed PC',
    })
  })

  it('requires authentication', async () => {
    await request(getApp())
      .get('/api/campaigns/000000000000000000000000/search/catalog')
      .expect(401)
  })

  it('limits player-visible characters to controlled open PCs', async () => {
    const owner = await registerOwner('search-catalog-player-visibility@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Search Visibility Campaign',
    )

    const managerVisibleCharacterId = await createCharacter(
      owner.agent,
      owner.csrfToken,
      'Manager Visible PC',
    )
    await seedCharacterParticipation({ campaignId, characterId: managerVisibleCharacterId })
    await setMembershipControlledPcs({
      campaignId,
      userId: owner.userId,
      controlledCharacterIds: [managerVisibleCharacterId],
    })

    const player = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'search-catalog-player@example.com',
      campaignRole: 'pc',
    })
    const playerCharacterId = await createCharacter(player.agent, player.csrfToken, 'Player PC')
    await seedCharacterParticipation({ campaignId, characterId: playerCharacterId })
    await setMembershipControlledPcs({
      campaignId,
      userId: player.userId,
      controlledCharacterIds: [playerCharacterId],
    })

    const playerCatalog = await player.agent
      .get(`/api/campaigns/${campaignId}/search/catalog`)
      .set(CSRF_HEADER, player.csrfToken)
      .expect(200)

    const playerCharacterDocs = playerCatalog.body.documents.filter(
      (document: { filterGroup: string; target: { kind: string; characterType?: string } }) =>
        document.filterGroup === 'characters' && document.target.kind === 'character',
    )
    expect(playerCharacterDocs).toHaveLength(1)
    expect(playerCharacterDocs[0]?.target.id).toBe(playerCharacterId)

    const managerCatalog = await owner.agent
      .get(`/api/campaigns/${campaignId}/search/catalog`)
      .set(CSRF_HEADER, owner.csrfToken)
      .expect(200)

    const managerCharacterIds = managerCatalog.body.documents
      .filter(
        (document: { filterGroup: string; target: { kind: string; characterType?: string } }) =>
          document.filterGroup === 'characters' &&
          document.target.kind === 'character' &&
          document.target.characterType === 'pc',
      )
      .map((document: { target: { id: string } }) => document.target.id)

    expect(managerCharacterIds).toEqual(
      expect.arrayContaining([managerVisibleCharacterId, playerCharacterId]),
    )
  })

  it('includes unavailable content for managers with campaignAvailable false', async () => {
    const owner = await registerOwner('search-catalog-unavailable@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Search Unavailable Campaign',
    )

    const createRes = await owner.agent
      .post(`/api/campaigns/${campaignId}/content/feats`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send({
        slug: 'hidden-search-feat',
        name: 'Hidden Search Feat',
        category: 'origin',
        repeatable: { allowed: false },
      })
      .expect(201)

    const featId = createRes.body.feats.id as string

    await owner.agent
      .patch(`/api/campaigns/${campaignId}/content/feats/${featId}/campaign-access`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ available: false, visibilityMode: 'all_players', participantIds: [] })
      .expect(200)

    const managerCatalog = await owner.agent
      .get(`/api/campaigns/${campaignId}/search/catalog`)
      .set(CSRF_HEADER, owner.csrfToken)
      .expect(200)

    const hiddenFeat = managerCatalog.body.documents.find(
      (document: { target: { kind: string; id: string } }) =>
        document.target.kind === 'feat' && document.target.id === featId,
    )
    expect(hiddenFeat).toMatchObject({
      title: 'Hidden Search Feat',
      campaignAvailable: false,
    })

    const player = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'search-catalog-unavailable-player@example.com',
      campaignRole: 'pc',
    })

    const playerCatalog = await player.agent
      .get(`/api/campaigns/${campaignId}/search/catalog`)
      .set(CSRF_HEADER, player.csrfToken)
      .expect(200)

    const playerHiddenFeat = playerCatalog.body.documents.find(
      (document: { target: { kind: string; id: string } }) =>
        document.target.kind === 'feat' && document.target.id === featId,
    )
    expect(playerHiddenFeat).toBeUndefined()
  })

  it('includes disabled vocabulary for managers with campaignAvailable false', async () => {
    const owner = await registerOwner('search-catalog-vocab-unavailable@example.com')
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Search Vocab Unavailable Campaign',
    )

    await owner.agent
      .patch(`/api/campaigns/${campaignId}/vocabulary/${CREATURE_TYPE_SET_ID}/entries/fey`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ status: 'disabled' })
      .expect(200)

    const managerCatalog = await owner.agent
      .get(`/api/campaigns/${campaignId}/search/catalog`)
      .set(CSRF_HEADER, owner.csrfToken)
      .expect(200)

    const disabledCreatureType = managerCatalog.body.documents.find(
      (document: {
        filterGroup: string
        target: { kind: string; setId: string; termId: string }
      }) =>
        document.filterGroup === 'game-terms' &&
        document.target.kind === 'game-term' &&
        document.target.setId === CREATURE_TYPE_SET_ID &&
        document.target.termId === 'fey',
    )
    expect(disabledCreatureType).toMatchObject({
      campaignAvailable: false,
    })

    const player = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'search-catalog-vocab-unavailable-player@example.com',
      campaignRole: 'pc',
    })

    const playerCatalog = await player.agent
      .get(`/api/campaigns/${campaignId}/search/catalog`)
      .set(CSRF_HEADER, player.csrfToken)
      .expect(200)

    const playerDisabledCreatureType = playerCatalog.body.documents.find(
      (document: { target: { kind: string; termId: string } }) =>
        document.target.kind === 'game-term' && document.target.termId === 'fey',
    )
    expect(playerDisabledCreatureType).toBeUndefined()
  })
})
