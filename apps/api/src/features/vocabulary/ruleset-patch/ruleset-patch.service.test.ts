import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request, { type Agent } from 'supertest'
import type { Express } from 'express'

import {
  CREATURE_TYPE_SET_ID,
  defaultCampaignMechanicsPatch,
  defaultMulticlassingRules,
} from '@rpg/contracts'

import { createApp } from '../../../app'
import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db'
import { CampaignRulesetPatchModel } from '../lib/campaign-ruleset-patch.model'
import {
  getRulesetPatchRead,
  updateCharacterCreationPatch,
  updateMechanicsPatch,
} from './ruleset-patch.service'
import { updateVocabularyEntry } from '../sets/vocabulary.service'
import { createCampaign } from '../../campaign'
import { createUser } from '../../user'

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
      multiclassing: defaultMulticlassingRules(),
    })
    expect(patch?.mechanics).toEqual(defaultCampaignMechanicsPatch())
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

  it('persists non-default multiclassing overrides', async () => {
    const owner = await makeUser('owner@example.com')
    const campaign = await createCampaign({ name: 'Multiclass', createdBy: owner.id })

    const patch = await updateCharacterCreationPatch(campaign.id, {
      multiclassing: {
        enabled: false,
        requirements: {
          primaryAbilityMinimum: { minimumScore: 15 },
        },
      },
    })

    expect(patch?.characterCreation.multiclassing).toMatchObject({
      enabled: false,
      requirements: {
        primaryAbilityMinimum: { enabled: true, minimumScore: 15 },
      },
    })

    const stored = await CampaignRulesetPatchModel.findOne({ campaignId: campaign.id }).lean()
    expect(stored?.characterCreation?.multiclassing?.enabled).toBe(false)
    expect(
      stored?.characterCreation?.multiclassing?.requirements?.primaryAbilityMinimum?.minimumScore,
    ).toBe(15)
  })

  it('deep-merges partial multiclassing patches without wiping sibling overrides', async () => {
    const owner = await makeUser('owner@example.com')
    const campaign = await createCampaign({ name: 'Multiclass', createdBy: owner.id })

    await updateCharacterCreationPatch(campaign.id, {
      multiclassing: {
        requirements: {
          primaryAbilityMinimum: { minimumScore: 15 },
        },
      },
    })

    const patch = await updateCharacterCreationPatch(campaign.id, {
      multiclassing: {
        requirements: {
          speciesPolicy: { enabled: true },
        },
      },
    })

    expect(patch?.characterCreation.multiclassing.requirements).toMatchObject({
      primaryAbilityMinimum: { enabled: true, minimumScore: 15 },
      speciesPolicy: { enabled: true },
      speciesLevelLimits: { enabled: false },
    })
  })

  it('unsets stored multiclassing when reverted to defaults', async () => {
    const owner = await makeUser('owner@example.com')
    const campaign = await createCampaign({ name: 'Multiclass', createdBy: owner.id })

    await updateCharacterCreationPatch(campaign.id, {
      multiclassing: { enabled: false },
    })

    await updateCharacterCreationPatch(campaign.id, {
      multiclassing: {
        enabled: true,
        requirements: {
          primaryAbilityMinimum: { enabled: true, minimumScore: 13 },
          speciesPolicy: { enabled: false },
          speciesLevelLimits: { enabled: false },
        },
      },
    })

    const stored = await CampaignRulesetPatchModel.findOne({ campaignId: campaign.id }).lean()
    expect(stored?.characterCreation?.multiclassing).toBeUndefined()
  })
})

describe('updateMechanicsPatch', () => {
  it('persists a non-default edition preset sparsely', async () => {
    const owner = await makeUser('owner@example.com')
    const campaign = await createCampaign({ name: 'Classic', createdBy: owner.id })

    const patch = await updateMechanicsPatch(campaign.id, {
      editionPreset: { id: 'becmi' },
    })

    expect(patch?.mechanics).toMatchObject({
      editionPreset: { id: 'becmi', modified: false },
      armorClass: { mode: 'descending', base: 9 },
      attackResolution: { mode: 'attack_matrix' },
    })
    expect(patch?.mechanics.editionPreset.appliedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)

    const stored = await CampaignRulesetPatchModel.findOne({ campaignId: campaign.id }).lean()
    expect(stored?.mechanics?.editionPreset?.id).toBe('becmi')
    expect(stored?.mechanics?.editionPreset?.appliedAt).toBeInstanceOf(Date)
    expect(stored?.mechanics?.armorClass).toBeUndefined()
    expect(stored?.mechanics?.attackResolution).toBeUndefined()
  })

  it('marks modified when knobs drift from the selected preset', async () => {
    const owner = await makeUser('owner@example.com')
    const campaign = await createCampaign({ name: 'Drift', createdBy: owner.id })

    await updateMechanicsPatch(campaign.id, { editionPreset: { id: '3e' } })

    const patch = await updateMechanicsPatch(campaign.id, {
      armorClass: { base: 9 },
    })

    expect(patch?.mechanics.editionPreset).toMatchObject({ id: '3e', modified: true })
    expect(patch?.mechanics.armorClass).toEqual({ mode: 'ascending', base: 9 })

    const stored = await CampaignRulesetPatchModel.findOne({ campaignId: campaign.id }).lean()
    expect(stored?.mechanics?.editionPreset?.modified).toBe(true)
    expect(stored?.mechanics?.armorClass).toEqual({ mode: 'ascending', base: 9 })
  })

  it('clears stored mechanics when reverting to the default 5e preset', async () => {
    const owner = await makeUser('owner@example.com')
    const campaign = await createCampaign({ name: 'Modern', createdBy: owner.id })

    await updateMechanicsPatch(campaign.id, { editionPreset: { id: '2e' } })
    const patch = await updateMechanicsPatch(campaign.id, { editionPreset: { id: '5e' } })

    expect(patch?.mechanics).toEqual(defaultCampaignMechanicsPatch())

    const stored = await CampaignRulesetPatchModel.findOne({ campaignId: campaign.id }).lean()
    expect(stored?.mechanics).toBeUndefined()
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

  it('patches multiclassing for campaign managers', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const res = await agent
      .patch(`/api/campaigns/${campaignId}/ruleset-patch/character-creation`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        multiclassing: { enabled: false },
      })
      .expect(200)

    expect(res.body.patch.characterCreation.multiclassing.enabled).toBe(false)
  })

  it('patches mechanics for campaign managers', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const res = await agent
      .patch(`/api/campaigns/${campaignId}/ruleset-patch/mechanics`)
      .set(CSRF_HEADER, csrfToken)
      .send({ editionPreset: { id: '1e' } })
      .expect(200)

    expect(res.body.patch.mechanics).toMatchObject({
      editionPreset: { id: '1e', modified: false },
      armorClass: { mode: 'descending', base: 10 },
      attackResolution: { mode: 'combat_tables' },
    })
  })

  it('requires authentication for ruleset patch reads', async () => {
    await request(app).get('/api/campaigns/000000000000000000000000/ruleset-patch').expect(401)
  })
})
