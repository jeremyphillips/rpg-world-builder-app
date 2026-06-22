import { CROSS_APP_PATHS, fetchCsrfToken } from '@rpg/contracts'
import type { SessionUser } from '@rpg/contracts'

import { CSRF_HEADER, request } from '@/lib/api-client'

/** @deprecated Prefer `CROSS_APP_PATHS.login` from `@rpg/contracts`. */
export const LOGIN_PATH = CROSS_APP_PATHS.login

/** Read the current session, or throw `ApiError` (401 when unauthenticated). */
export async function fetchSession(): Promise<SessionUser> {
  const { user } = await request<{ user: SessionUser }>(
    '/api/auth/me',
    undefined,
    'Not authenticated.',
  )
  return user
}

/** End the session (clears the host-only session cookie on the API). */
export async function logout(): Promise<void> {
  const csrfToken = await fetchCsrfToken()
  await request(
    '/api/auth/logout',
    { method: 'POST', headers: { [CSRF_HEADER]: csrfToken } },
    'Unable to log out. Please try again.',
  )
}
