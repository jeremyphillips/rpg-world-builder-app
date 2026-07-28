import request, { type Agent } from 'supertest'
import type { Express } from 'express'

import { CSRF_HEADER } from '../lib/cookies'

export const defaultTestCredentials = {
  email: 'dm@example.com',
  password: 'supersecret',
  displayName: 'Game Master',
}

/** A supertest agent that persists cookies, primed with a CSRF token. */
export async function newAuthAgent(app: Express): Promise<{ agent: Agent; csrfToken: string }> {
  const agent = request.agent(app)
  const res = await agent.get('/api/auth/csrf')
  return { agent, csrfToken: res.body.csrfToken as string }
}

export type AuthAgentSession = {
  agent: Agent
  csrfToken: string
  userId: string
}

export async function registerTestUser(
  app: Express,
  credentials = defaultTestCredentials,
): Promise<AuthAgentSession> {
  const { agent, csrfToken } = await newAuthAgent(app)
  const registerRes = await agent
    .post('/api/auth/register')
    .set(CSRF_HEADER, csrfToken)
    .send(credentials)
    .expect(201)
  const userId = registerRes.body.user?.id as string | undefined
  if (!userId) {
    throw new Error('Register response missing user.id')
  }
  return { agent, csrfToken, userId }
}

export async function registerAndLoginTestUser(
  app: Express,
  credentials = defaultTestCredentials,
): Promise<AuthAgentSession> {
  const { agent } = await newAuthAgent(app)
  const csrf1 = (await agent.get('/api/auth/csrf')).body.csrfToken as string
  await agent.post('/api/auth/register').set(CSRF_HEADER, csrf1).send(credentials).expect(201)
  const loginRes = await agent
    .post('/api/auth/login')
    .set(CSRF_HEADER, csrf1)
    .send({ email: credentials.email, password: credentials.password })
    .expect(200)

  const userId = loginRes.body.user?.id as string | undefined
  if (!userId) {
    throw new Error('Login response missing user.id')
  }

  const csrfToken =
    typeof loginRes.body.csrfToken === 'string'
      ? loginRes.body.csrfToken
      : ((await agent.get('/api/auth/csrf')).body.csrfToken as string)

  return { agent, csrfToken, userId }
}

export async function createTestCampaign(
  agent: Agent,
  csrfToken: string,
  name = 'Test Campaign',
): Promise<string> {
  const createRes = await agent
    .post('/api/campaigns')
    .set(CSRF_HEADER, csrfToken)
    .send({ name })
    .expect(201)
  return createRes.body.campaign.id as string
}
