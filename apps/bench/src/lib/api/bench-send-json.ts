import { request } from '@rpg/api-client'

/** POST/PATCH/DELETE without CSRF — /api/bench is exempt (plan 02). */
export async function benchSendJson<T>(
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  fallbackMessage = 'Request failed.',
): Promise<T> {
  return request<T>(
    path,
    {
      method,
      headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    },
    fallbackMessage,
  )
}
