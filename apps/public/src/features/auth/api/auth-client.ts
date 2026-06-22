import { postJson } from '@rpg/api-client'
import { CROSS_APP_PATHS } from '@rpg/contracts'
import type { LoginInput, RegisterInput, SessionUser } from '@rpg/contracts'

export { ApiError } from '@rpg/contracts'
export { fetchSession, logout } from '@rpg/api-client'

/** @deprecated Prefer `CROSS_APP_PATHS.dashboard` from `@rpg/contracts`. */
export const DASHBOARD_PATH = CROSS_APP_PATHS.dashboard

export function login(input: LoginInput): Promise<{ user: SessionUser }> {
  return postJson<{ user: SessionUser }>('/api/auth/login', input)
}

export function register(input: RegisterInput): Promise<{ user: SessionUser }> {
  return postJson<{ user: SessionUser }>('/api/auth/register', input)
}
