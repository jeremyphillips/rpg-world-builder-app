import { parseCookie } from 'cookie'
import type { Socket } from 'socket.io'

import { findSessionUserById } from '../features/user'
import { SESSION_COOKIE } from '../lib/cookies'
import { verifySessionToken } from '../lib/jwt'

export type AuthenticatedSocketData = {
  userId: string
}

export async function authenticateSocket(socket: Socket): Promise<AuthenticatedSocketData | null> {
  const rawCookie = socket.handshake.headers.cookie
  if (!rawCookie) return null

  const cookies = parseCookie(rawCookie)
  const token = cookies[SESSION_COOKIE]
  if (!token) return null

  const claims = verifySessionToken(token)
  if (!claims) return null

  const user = await findSessionUserById(claims.sub)
  if (!user) return null

  return { userId: user.id }
}
