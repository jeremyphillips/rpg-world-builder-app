import { postJson } from '@/lib/api-client'

/**
 * POST `/api/campaigns/:campaignId/content/:routeKey/:entityId/duplicate`.
 * Returns the created entity through the same response envelope as ordinary create.
 */
export async function duplicateContent<T>(
  campaignId: string,
  routeKey: string,
  entityId: string,
  input: { name: string },
  fallbackMessage?: string,
): Promise<T> {
  const body = await postJson<Record<string, T>>(
    `/api/campaigns/${campaignId}/content/${routeKey}/${entityId}/duplicate`,
    input,
    fallbackMessage ?? `Could not duplicate ${routeKey}.`,
  )
  const [entity] = Object.values(body)
  return entity as T
}
