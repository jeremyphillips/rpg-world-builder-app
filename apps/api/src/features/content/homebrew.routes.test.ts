import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import type { Agent } from 'supertest'
import type { Express } from 'express'

import { createApp } from '../../app'
import { CSRF_HEADER } from '../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../test/auth-agent'
import { clearTestDb, startTestDb, stopTestDb } from '../../test/db'
import { HOMEBREW_SUMMARY_TYPES } from './content-types'

let app: Express

async function registerAndLogin(): Promise<{ agent: Agent; csrfToken: string }> {
  return registerAndLoginTestUser(app)
}

beforeAll(async () => {
  await startTestDb()
  app = createApp()
})

afterAll(async () => {
  await stopTestDb()
})

afterEach(async () => {
  await clearTestDb()
})

describe('homebrew routes', () => {
  it('returns the homebrew content summary for campaign members', async () => {
    const { agent, csrfToken } = await registerAndLogin()
    const campaignId = await createTestCampaign(agent, csrfToken)

    const summaryRes = await agent
      .get(`/api/campaigns/${campaignId}/homebrew/summary`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(summaryRes.body.summary.content).toHaveLength(HOMEBREW_SUMMARY_TYPES.length)
  })
})
