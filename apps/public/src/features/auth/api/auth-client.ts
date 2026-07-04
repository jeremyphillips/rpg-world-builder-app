import { postJson } from '@rpg/api-client'
import type { LoginInput, RegisterInput, SessionUser } from '@rpg/contracts'

export { ApiError } from '@rpg/contracts'
export { fetchSession, logout } from '@rpg/api-client'

export function login(input: LoginInput): Promise<{ user: SessionUser }> {
  return postJson<{ user: SessionUser }>('/api/auth/login', input)
}

export function register(input: RegisterInput): Promise<{ user: SessionUser }> {
  return postJson<{ user: SessionUser }>('/api/auth/register', input)
}
