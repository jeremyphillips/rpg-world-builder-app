import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request, { type Agent } from 'supertest'
import type { Express } from 'express'

import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'

import { createApp } from '../../app'
import { CSRF_HEADER } from '../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../test/auth-agent'
import { clearTestDb, startTestDb, stopTestDb } from '../../test/db'
import { CampaignRulesetPatchModel } from './campaign-ruleset-patch.model'
import { getRulesetPatchRead, updateCharacterCreationPatch } from './ruleset-patch.service'
import { updateVocabularyEntry } from './vocabulary.service'
import { createCampaign } from '../campaign'
import { createUser } from '../user'

let app: Express

beforeAll(async () => {
  await startTestDb()
  app = createApp()
})

afterAll(async () => {
  await stopTestDb()
})

beforeEach(async () => {
  await clearTestDb()
})

async function makeUser(email: string) {
  return createUser({ email, passwordHash: 'x', displayName: email })
}

describe('getRulesetPatchRead', () => {
  it('returns resolved defaults when no patch document exists', async () => {
    const owner = await makeUser('owner@example.com')
    const campaign = await createCampaign({ name: 'Defaults', createdBy: owner.id })

    const patch = await getRulesetPatchRead(campaign.id)

    expect(patch?.characterCreation).toMatchObject({
      startingLevel: 1,
      importedCharacters: { policy: 'disabled' },
      progression: { maxCharacterLevel: 20 },
      species: { creatureTypePolicy: { mode: 'only', ids: ['humanoid'] } },
    })
  })
})

describe('updateCharacterCreationPatch', () => {
  it('persists extended progression on the ruleset patch', async () => {
    const owner = await makeUser('owner@example.com')
    const campaign = await createCampaign({ name: 'Epic', createdBy: owner.id })

    const patch = await updateCharacterCreationPatch(campaign.id, {
      progression: {
        maxCharacterLevel: 20,
        extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
      },
    })

    expect(patch?.characterCreation.progression.extendedProgression).toEqual({
      tierName: 'Epic Destiny',
      maxLevel: 30,
    })

    const stored = await CampaignRulesetPatchModel.findOne({ campaignId: campaign.id }).lean()
    expect(stored?.characterCreation?.progression?.extendedProgression).toEqual({
      tierName: 'Epic Destiny',
      maxLevel: 30,
    })
  })

  it('persists creature type policy on the ruleset patch', async () => {
    const owner = await makeUser('owner@example.com')
    const campaign = await createCampaign({ name: 'Types', createdBy: owner.id })

    const patch = await updateCharacterCreationPatch(campaign.id, {
      species: {
        creatureTypePolicy: { mode: 'only', ids: ['humanoid', 'fey'] },
      },
    })

    expect(patch?.characterCreation.species.creatureTypePolicy).toEqual({
      mode: 'only',
      ids: ['humanoid', 'fey'],
    })
  })

  it('rejects disabled creature types in the creature type policy', async () => {
    const owner = await makeUser('owner@example.com')
    const campaign = await createCampaign({ name: 'Types', createdBy: owner.id })

    await updateVocabularyEntry(campaign.id, CREATURE_TYPE_SET_ID, 'fey', {
      status: 'disabled',
    })

    await expect(
      updateCharacterCreationPatch(campaign.id, {
        species: {
          creatureTypePolicy: { mode: 'only', ids: ['humanoid', 'fey'] },
        },
      }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'invalid_vocabulary',
    })
  })

  it('unsets extended progression when omitted from a progression patch', async () => {
    const owner = await makeUser('owner@example.com')
    const campaign = await createCampaign({
      name: 'Epic',
      createdBy: owner.id,
      characterCreation: {
        progression: {
          maxCharacterLevel: 20,
          extendedProgression: { tierName: 'Epic Destiny', maxLevel: 30 },
        },
      },
    })

    const patch = await updateCharacterCreationPatch(campaign.id, {
      progression: { maxCharacterLevel: 20 },
    })

    expect(patch?.characterCreation.progression.extendedProgression).toBeUndefined()

    const stored = await CampaignRulesetPatchModel.findOne({ campaignId: campaign.id }).lean()
    expect(stored?.characterCreation?.progression?.extendedProgression).toBeUndefined()
  })
})

describe('ruleset patch routes', () => {
  async function registerAndLogin(): Promise<{ agent: Agent; csrfToken: string }> {
    return registerAndLoginTestUser(app)
  }

  it('returns resolved character creation for campaign members', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const res = await agent
      .get(`/api/campaigns/${campaignId}/ruleset-patch`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(res.body.patch.characterCreation.startingLevel).toBe(1)
  })

  it('patches character creation for campaign managers', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const res = await agent
      .patch(`/api/campaigns/${campaignId}/ruleset-patch/character-creation`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        startingLevel: 5,
        importedCharacters: { policy: 'approval_required' },
      })
      .expect(200)

    expect(res.body.patch.characterCreation).toMatchObject({
      startingLevel: 5,
      importedCharacters: { policy: 'approval_required' },
    })
  })

  it('requires authentication for ruleset patch reads', async () => {
    await request(app).get('/api/campaigns/000000000000000000000000/ruleset-patch').expect(401)
  })
})
