import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import request, { type Agent } from 'supertest'
import type { Express } from 'express'

import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'

import { createApp } from '../../../app'
import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { clearTestDb, startTestDb, stopTestDb } from '../../../test/db'

let app: Express

async function registerAndLogin(): Promise<{ agent: Agent; csrfToken: string }> {
  return registerAndLoginTestUser(app)
}

async function createCampaign(agent: Agent, csrfToken: string): Promise<string> {
  return createTestCampaign(agent, csrfToken, 'Vocabulary Test')
}

beforeAll(async () => {
  await startTestDb()
  app = createApp()
})

afterEach(async () => {
  await clearTestDb()
})

afterAll(async () => {
  await stopTestDb()
})

describe('vocabulary routes', () => {
  it('lists and reads resolved vocabulary sets for campaign members', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createCampaign(agent, csrfToken)

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/vocabulary`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(listRes.body.sets.length).toBeGreaterThan(0)

    const setRes = await agent
      .get(`/api/campaigns/${campaignId}/vocabulary/${CREATURE_TYPE_SET_ID}`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(setRes.body.set.id).toBe(CREATURE_TYPE_SET_ID)
    expect(setRes.body.set.options.some((option: { id: string }) => option.id === 'humanoid')).toBe(
      true,
    )
  })

  it('creates, patches, and deletes campaign vocabulary entries for managers', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createCampaign(agent, csrfToken)

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/vocabulary/${CREATURE_TYPE_SET_ID}/entries`)
      .set(CSRF_HEADER, csrfToken)
      .send({ id: 'robot', label: 'Robot' })
      .expect(201)

    expect(createRes.body.set.options.some((option: { id: string }) => option.id === 'robot')).toBe(
      true,
    )

    const patchRes = await agent
      .patch(`/api/campaigns/${campaignId}/vocabulary/${CREATURE_TYPE_SET_ID}/entries/robot`)
      .set(CSRF_HEADER, csrfToken)
      .send({ label: 'Automaton' })
      .expect(200)

    expect(
      patchRes.body.set.options.find((option: { id: string }) => option.id === 'robot')?.label,
    ).toBe('Automaton')

    const deleteRes = await agent
      .delete(`/api/campaigns/${campaignId}/vocabulary/${CREATURE_TYPE_SET_ID}/entries/robot`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(deleteRes.body.set.options.some((option: { id: string }) => option.id === 'robot')).toBe(
      false,
    )
  })

  it('rejects duplicate ids and forbids deleting system entries', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createCampaign(agent, csrfToken)

    await agent
      .post(`/api/campaigns/${campaignId}/vocabulary/${CREATURE_TYPE_SET_ID}/entries`)
      .set(CSRF_HEADER, csrfToken)
      .send({ id: 'humanoid', label: 'Duplicate' })
      .expect(409)

    await agent
      .delete(`/api/campaigns/${campaignId}/vocabulary/${CREATURE_TYPE_SET_ID}/entries/humanoid`)
      .set(CSRF_HEADER, csrfToken)
      .expect(403)
  })

  it('requires authentication for vocabulary reads', async () => {
    await request(app).get('/api/campaigns/000000000000000000000000/vocabulary').expect(401)
  })
})
