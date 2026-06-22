import type { AuthMeResponse } from '@rpg/contracts'
import { fetchCsrfToken } from '@rpg/contracts'

import { CSRF_HEADER, request } from './request'

/** Read the current session, or throw `ApiError` (401 when unauthenticated). */
export async function fetchSession(): Promise<AuthMeResponse> {
  return request<AuthMeResponse>('/api/auth/me', undefined, 'Not authenticated.')
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
