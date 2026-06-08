import { ApiError, fetchCsrfToken } from '@rpg/contracts'

export const CSRF_HEADER = 'x-csrf-token'

interface ErrorBody {
  error?: { code?: string; message?: string }
}

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.'

/**
 * Same-origin fetch that parses a JSON body and throws `ApiError` on a non-OK
 * response. Centralizes the credentials + error-shape handling shared by every
 * dashboard API client.
 */
export async function request<T>(
  path: string,
  init?: RequestInit,
  fallbackMessage: string = DEFAULT_ERROR_MESSAGE,
): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init })
  const data = (await res.json().catch(() => null)) as (ErrorBody & T) | null
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error?.code ?? 'request_error',
      data?.error?.message ?? fallbackMessage,
    )
  }
  return data as T
}

/** POST a JSON body with the double-submit CSRF token attached. */
export async function postJson<T>(
  path: string,
  body: unknown,
  fallbackMessage?: string,
): Promise<T> {
  const csrfToken = await fetchCsrfToken()
  return request<T>(
    path,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', [CSRF_HEADER]: csrfToken },
      body: JSON.stringify(body),
    },
    fallbackMessage,
  )
}
