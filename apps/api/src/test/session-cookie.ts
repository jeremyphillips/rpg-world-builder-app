import type { PlatformRole } from '@rpg/contracts'
import type { Agent } from 'supertest'

import { SESSION_COOKIE } from '../lib/cookies'
import { signSessionToken } from '../lib/jwt'

type AgentWithCookieJar = Agent & {
  jar: {
    getCookie(
      name: string,
      opts: { path: string; domain: string },
    ): { name: string; value: string } | undefined
  }
}

/** Builds a session cookie header for Socket.IO handshake tests. */
export function buildSessionCookieHeader(userId: string, role: PlatformRole = 'user'): string {
  return `${SESSION_COOKIE}=${signSessionToken({ sub: userId, role })}`
}

/** Reads the session cookie the login agent received (production auth path). */
export function getSessionCookieHeaderFromAgent(agent: Agent, baseUrl: string): string {
  const { hostname } = new URL(baseUrl)
  const cookie = (agent as AgentWithCookieJar).jar.getCookie(SESSION_COOKIE, {
    path: '/',
    domain: hostname,
  })
  if (!cookie) {
    throw new Error(`Agent missing ${SESSION_COOKIE} cookie for ${baseUrl}`)
  }
  return `${cookie.name}=${cookie.value}`
}
