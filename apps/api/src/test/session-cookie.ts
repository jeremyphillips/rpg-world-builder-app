import type { PlatformRole } from '@rpg/contracts'

import { SESSION_COOKIE } from '../lib/cookies'
import { signSessionToken } from '../lib/jwt'

/** Builds a session cookie header for Socket.IO handshake tests. */
export function buildSessionCookieHeader(userId: string, role: PlatformRole = 'user'): string {
  return `${SESSION_COOKIE}=${signSessionToken({ sub: userId, role })}`
}
