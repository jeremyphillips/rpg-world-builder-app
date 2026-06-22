import { fetchSession as fetchAuthMe, logout } from '@rpg/api-client'
import { CROSS_APP_PATHS } from '@rpg/contracts'
import type { SessionUser } from '@rpg/contracts'

/** @deprecated Prefer `CROSS_APP_PATHS.login` from `@rpg/contracts`. */
export const LOGIN_PATH = CROSS_APP_PATHS.login

export { logout }

/**
 * Read the current session user, or throw `ApiError` (401 when unauthenticated).
 * Returns only the user slice until dashboard callers adopt `AuthMeResponse`.
 */
export async function fetchSession(): Promise<SessionUser> {
  const { user } = await fetchAuthMe()
  return user
}
