import { CONTENT_DUPLICATION_IDEMPOTENCY_HEADER, fetchCsrfToken } from '@rpg/contracts'

import { CSRF_HEADER, request } from '@/lib/api-client'

/**
 * POST `/api/campaigns/:campaignId/content/:routeKey/:entityId/duplicate`.
 * Returns the created entity through the same response envelope as ordinary create.
 */
export async function duplicateContent<T>(
  campaignId: string,
  routeKey: string,
  entityId: string,
  input: { name: string; idempotencyKey?: string },
  fallbackMessage?: string,
): Promise<T> {
  const csrfToken = await fetchCsrfToken()
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    [CSRF_HEADER]: csrfToken,
  }
  if (input.idempotencyKey) {
    headers[CONTENT_DUPLICATION_IDEMPOTENCY_HEADER] = input.idempotencyKey
  }

  const body = await request<Record<string, T>>(
    `/api/campaigns/${campaignId}/content/${routeKey}/${entityId}/duplicate`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: input.name }),
    },
    fallbackMessage ?? `Could not duplicate ${routeKey}.`,
  )
  const [entity] = Object.values(body)
  return entity as T
}
