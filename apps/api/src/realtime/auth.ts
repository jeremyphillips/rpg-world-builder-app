import { parseCookie } from 'cookie'
import type { Socket } from 'socket.io'

import { findSessionUserById } from '../features/user'
import { SESSION_COOKIE } from '../lib/cookies'
import { verifySessionToken } from '../lib/jwt'

export type AuthenticatedSocketData = {
  userId: string
}

const SESSION_USER_LOOKUP_RETRY_DELAY_MS = 50

async function findSessionUserForSocket(userId: string) {
  try {
    return await findSessionUserById(userId)
  } catch (firstError) {
    await new Promise((resolve) => setTimeout(resolve, SESSION_USER_LOOKUP_RETRY_DELAY_MS))
    try {
      return await findSessionUserById(userId)
    } catch {
      throw firstError
    }
  }
}

export async function authenticateSocket(socket: Socket): Promise<AuthenticatedSocketData | null> {
  const rawCookie = socket.handshake.headers.cookie
  if (!rawCookie) return null

  const cookies = parseCookie(rawCookie)
  const token = cookies[SESSION_COOKIE]
  if (!token) return null

  const claims = verifySessionToken(token)
  if (!claims) return null

  const user = await findSessionUserForSocket(claims.sub)
  if (!user) return null

  return { userId: user.id }
}
