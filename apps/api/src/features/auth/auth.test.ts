import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import request, { type Agent } from 'supertest'
import type { Express } from 'express'

import { createApp } from '../../app'
import { CSRF_HEADER } from '../../lib/cookies'
import {
  defaultTestCredentials,
  newAuthAgent,
  registerAndLoginTestUser,
  registerTestUser,
} from '../../test/auth-agent'
import { clearTestDb, startTestDb, stopTestDb } from '../../test/db'
import { updateLastSelectedCampaign } from '../user'

let app: Express

const credentials = defaultTestCredentials

async function newAgent(): Promise<{ agent: Agent; csrfToken: string }> {
  return newAuthAgent(app)
}

async function registerUser(): Promise<{ agent: Agent; csrfToken: string }> {
  return registerTestUser(app, credentials)
}

async function registerAndLogin(): Promise<{ agent: Agent; csrfToken: string }> {
  return registerAndLoginTestUser(app, credentials)
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

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/api/health').expect(200)
    expect(res.body.status).toBe('ok')
  })
})

describe('auth flow', () => {
  it('registers, logs in (sets cookie), reads /me, logs out, then 401s', async () => {
    const { agent, csrfToken } = await newAgent()

    const registerRes = await agent
      .post('/api/auth/register')
      .set(CSRF_HEADER, csrfToken)
      .send(credentials)
      .expect(201)
    expect(registerRes.body.user).toMatchObject({
      email: credentials.email,
      displayName: credentials.displayName,
      role: 'user',
    })
    expect(registerRes.body.user.password).toBeUndefined()
    expect(registerRes.body.user.passwordHash).toBeUndefined()

    const loginRes = await agent
      .post('/api/auth/login')
      .set(CSRF_HEADER, csrfToken)
      .send({ email: credentials.email, password: credentials.password })
      .expect(200)
    const setCookies = loginRes.headers['set-cookie'] as unknown as string[]
    expect(setCookies.some((c) => c.startsWith('rpg_session=') && c.includes('HttpOnly'))).toBe(
      true,
    )

    const meRes = await agent.get('/api/auth/me').expect(200)
    expect(meRes.body).toMatchObject({
      user: { email: credentials.email },
      activeCampaign: null,
    })

    const logoutToken = loginRes.body.csrfToken as string
    await agent.post('/api/auth/logout').set(CSRF_HEADER, logoutToken).expect(200)

    await agent.get('/api/auth/me').expect(401)
  })

  it('rejects login with a wrong password', async () => {
    const { agent, csrfToken } = await registerUser()
    await agent
      .post('/api/auth/login')
      .set(CSRF_HEADER, csrfToken)
      .send({ email: credentials.email, password: 'wrongpassword' })
      .expect(401)
  })

  it('rejects /me without a session cookie', async () => {
    await request(app).get('/api/auth/me').expect(401)
  })

  it('rejects duplicate registration with 409', async () => {
    const { agent, csrfToken } = await registerUser()
    await agent.post('/api/auth/register').set(CSRF_HEADER, csrfToken).send(credentials).expect(409)
  })

  it('rejects invalid register payloads with 400', async () => {
    const { agent, csrfToken } = await newAgent()
    const res = await agent
      .post('/api/auth/register')
      .set(CSRF_HEADER, csrfToken)
      .send({ email: 'not-an-email', password: 'short', displayName: '' })
      .expect(400)
    expect(res.body.error.code).toBe('bad_request')
    expect(res.body.error.details.issues.length).toBeGreaterThan(0)
  })
})

describe('CSRF double-submit guard', () => {
  it('rejects a mutation with no CSRF header (403)', async () => {
    const { agent } = await newAgent()
    const res = await agent.post('/api/auth/register').send(credentials).expect(403)
    expect(res.body.error.code).toBe('forbidden')
  })

  it('rejects a mutation when header does not match the cookie (403)', async () => {
    const { agent } = await newAgent()
    await agent
      .post('/api/auth/register')
      .set(CSRF_HEADER, 'tampered-value')
      .send(credentials)
      .expect(403)
  })

  it('accepts a mutation when header matches the cookie', async () => {
    const { agent, csrfToken } = await newAgent()
    await agent.post('/api/auth/register').set(CSRF_HEADER, csrfToken).send(credentials).expect(201)
  })

  it('does not require a token for safe (GET) requests', async () => {
    await request(app).get('/api/health').expect(200)
  })
})

// Touch the helper so it is covered even though the flow tests inline their steps.
describe('session reuse', () => {
  it('keeps the session across requests via the cookie jar', async () => {
    const { agent } = await registerAndLogin()
    await agent.get('/api/auth/me').expect(200)
  })
})

describe('GET /api/auth/me activeCampaign', () => {
  it('returns activeCampaign null for a user with no campaigns', async () => {
    const { agent } = await registerAndLogin()
    const meRes = await agent.get('/api/auth/me').expect(200)
    expect(meRes.body.activeCampaign).toBeNull()
  })

  it('returns the selected campaign when lastSelectedCampaignId is valid', async () => {
    const { agent, csrfToken } = await registerAndLogin()

    const createRes = await agent
      .post('/api/campaigns')
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Sunless Citadel' })
      .expect(201)
    const campaignId = createRes.body.campaign.id as string

    await agent
      .put('/api/campaigns/selection')
      .set(CSRF_HEADER, csrfToken)
      .send({ campaignId })
      .expect(200)

    const meRes = await agent.get('/api/auth/me').expect(200)
    expect(meRes.body.activeCampaign).toStrictEqual({
      id: campaignId,
      name: 'Sunless Citadel',
    })
  })

  it('lazy-clears a stale lastSelectedCampaignId over HTTP', async () => {
    const { agent, csrfToken } = await registerAndLogin()

    await agent
      .post('/api/campaigns')
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Alpha' })
      .expect(201)
    await agent
      .post('/api/campaigns')
      .set(CSRF_HEADER, csrfToken)
      .send({ name: 'Beta' })
      .expect(201)

    const staleId = '507f1f77bcf86cd799439011'
    const meBefore = await agent.get('/api/auth/me').expect(200)
    const userId = meBefore.body.user.id as string

    await updateLastSelectedCampaign(userId, staleId)

    const meRes = await agent.get('/api/auth/me').expect(200)
    expect(meRes.body.activeCampaign).toBeNull()
    expect(meRes.body.user.lastSelectedCampaignId).toBeNull()

    const meAgain = await agent.get('/api/auth/me').expect(200)
    expect(meAgain.body.user.lastSelectedCampaignId).toBeNull()
  })
})
