// fallow-ignore-file code-duplication
import { ApiError, CROSS_APP_PATHS, fetchCsrfToken } from '@rpg/contracts'
import type { LoginInput, RegisterInput, SessionUser } from '@rpg/contracts'

export { ApiError }

/** @deprecated Prefer `CROSS_APP_PATHS.dashboard` from `@rpg/contracts`. */
export const DASHBOARD_PATH = CROSS_APP_PATHS.dashboard

interface ErrorBody {
  error?: { code?: string; message?: string }
}

const CSRF_HEADER = 'x-csrf-token'

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const csrfToken = await fetchCsrfToken()
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json', [CSRF_HEADER]: csrfToken },
    body: JSON.stringify(body),
  })

  const data = (await res.json().catch(() => null)) as (ErrorBody & T) | null
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error?.code ?? 'request_error',
      data?.error?.message ?? 'Something went wrong. Please try again.',
    )
  }
  return data as T
}

export function login(input: LoginInput): Promise<{ user: SessionUser }> {
  return postJson<{ user: SessionUser }>('/api/auth/login', input)
}

export function register(input: RegisterInput): Promise<{ user: SessionUser }> {
  return postJson<{ user: SessionUser }>('/api/auth/register', input)
}
