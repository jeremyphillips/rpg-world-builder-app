import request, { type Agent } from 'supertest'
import type { Express } from 'express'

import { CSRF_HEADER } from '../lib/cookies'

export const defaultTestCredentials = {
  email: 'dm@example.com',
  password: 'supersecret',
  displayName: 'Game Master',
}

/** A supertest agent that persists cookies, primed with a CSRF token. */
async function readCsrfToken(agent: Agent): Promise<string> {
  const res = await agent.get('/api/auth/csrf').expect(200)
  const token = res.body?.csrfToken
  if (typeof token !== 'string' || token.length === 0) {
    throw new Error(
      `CSRF response missing csrfToken (status ${res.status}, body ${JSON.stringify(res.body)})`,
    )
  }
  return token
}

export async function newAuthAgent(app: Express): Promise<{ agent: Agent; csrfToken: string }> {
  const agent = request.agent(app)
  const csrfToken = await readCsrfToken(agent)
  return { agent, csrfToken }
}

export type AuthAgentSession = {
  agent: Agent
  csrfToken: string
  userId: string
}

function formatAuthBodyError(action: string, status: number, body: unknown): string {
  let serialized: string
  try {
    serialized = JSON.stringify(body)
  } catch {
    serialized = String(body)
  }
  return `${action} response missing user.id (status ${status}, body ${serialized})`
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
    throw new Error(formatAuthBodyError('Register', registerRes.status, registerRes.body))
  }
  return { agent, csrfToken, userId }
}

export async function registerAndLoginTestUser(
  app: Express,
  credentials = defaultTestCredentials,
): Promise<AuthAgentSession> {
  const agent = request.agent(app)
  const csrfForRegister = await readCsrfToken(agent)
  await agent
    .post('/api/auth/register')
    .set(CSRF_HEADER, csrfForRegister)
    .send(credentials)
    .expect(201)

  const csrfForLogin = await readCsrfToken(agent)
  const loginRes = await agent
    .post('/api/auth/login')
    .set(CSRF_HEADER, csrfForLogin)
    .send({ email: credentials.email, password: credentials.password })
    .expect(200)

  const userId = loginRes.body.user?.id as string | undefined
  if (!userId) {
    throw new Error(formatAuthBodyError('Login', loginRes.status, loginRes.body))
  }

  const loginCsrf = loginRes.body?.csrfToken
  const csrfToken =
    typeof loginCsrf === 'string' && loginCsrf.length > 0 ? loginCsrf : await readCsrfToken(agent)

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
