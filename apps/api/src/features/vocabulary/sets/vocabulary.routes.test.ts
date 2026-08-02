import request, { type Agent } from 'supertest'
import { describe, expect, it } from 'vitest'

import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'

import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { useIntegrationApp } from '../../../test/setup/integration-app'

const getApp = useIntegrationApp()

async function registerAndLogin(): Promise<{ agent: Agent; csrfToken: string }> {
  return registerAndLoginTestUser(getApp())
}

async function createCampaign(agent: Agent, csrfToken: string): Promise<string> {
  return createTestCampaign(agent, csrfToken, 'Vocabulary Test')
}

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
      .send({ label: 'Humanoid' })
      .expect(409)

    await agent
      .delete(`/api/campaigns/${campaignId}/vocabulary/${CREATURE_TYPE_SET_ID}/entries/humanoid`)
      .set(CSRF_HEADER, csrfToken)
      .expect(403)
  })

  it('requires authentication for vocabulary reads', async () => {
    await request(getApp()).get('/api/campaigns/000000000000000000000000/vocabulary').expect(401)
  })

  it('returns vocabulary entry usage with derived usedBy count', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createCampaign(agent, csrfToken)

    const usageRes = await agent
      .get(`/api/campaigns/${campaignId}/vocabulary/${CREATURE_TYPE_SET_ID}/entries/humanoid/usage`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(usageRes.body.usage.usedBy).toBe(usageRes.body.usage.references.length)
    expect(Array.isArray(usageRes.body.usage.references)).toBe(true)
  })

  it('returns batch usage summary labels and bounded usedBySummary on set reads', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createCampaign(agent, csrfToken)

    const setRes = await agent
      .get(`/api/campaigns/${campaignId}/vocabulary/${CREATURE_TYPE_SET_ID}`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(setRes.body.set.usageSummaryLabels).toEqual({
      singular: 'species',
      plural: 'species',
    })

    const humanoid = setRes.body.set.options.find(
      (option: { id: string }) => option.id === 'humanoid',
    )
    expect(humanoid.usedBy).toBeGreaterThanOrEqual(0)
    if (humanoid.usedBy > 0) {
      expect(humanoid.usedBySummary.length).toBeLessThanOrEqual(4)
      expect(humanoid.usedBySummary.length).toBeLessThanOrEqual(humanoid.usedBy)
    }
  })

  it('rejects create payloads with setId in the body', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createCampaign(agent, csrfToken)

    await agent
      .post(`/api/campaigns/${campaignId}/vocabulary/${CREATURE_TYPE_SET_ID}/entries`)
      .set(CSRF_HEADER, csrfToken)
      .send({ setId: CREATURE_TYPE_SET_ID, label: 'Robot' })
      .expect(400)
  })

  it('returns delete availability preflight for campaign entries', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createCampaign(agent, csrfToken)

    await agent
      .post(`/api/campaigns/${campaignId}/vocabulary/${CREATURE_TYPE_SET_ID}/entries`)
      .set(CSRF_HEADER, csrfToken)
      .send({ label: 'Robot' })
      .expect(201)

    const availabilityRes = await agent
      .get(
        `/api/campaigns/${campaignId}/vocabulary/${CREATURE_TYPE_SET_ID}/entries/robot/delete-availability`,
      )
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(availabilityRes.body.availability.status).toBe('allowed')
  })

  it('forbids vocabulary mutations when set capabilities are disabled', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createCampaign(agent, csrfToken)

    await agent
      .post(`/api/campaigns/${campaignId}/vocabulary/damage-types/entries`)
      .set(CSRF_HEADER, csrfToken)
      .send({ label: 'Psychic' })
      .expect(403)

    await agent
      .patch(`/api/campaigns/${campaignId}/vocabulary/damage-types/entries/psychic`)
      .set(CSRF_HEADER, csrfToken)
      .send({ label: 'Psionic' })
      .expect(403)

    await agent
      .delete(`/api/campaigns/${campaignId}/vocabulary/damage-types/entries/psychic`)
      .set(CSRF_HEADER, csrfToken)
      .expect(403)
  })

  it('returns not found for disable preflight when disableGuard is disabled', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createCampaign(agent, csrfToken)

    await agent
      .get(
        `/api/campaigns/${campaignId}/vocabulary/damage-types/entries/psychic/disable-availability`,
      )
      .set(CSRF_HEADER, csrfToken)
      .expect(404)
  })
})
