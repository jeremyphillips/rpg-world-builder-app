import type { UseQueryResult } from '@tanstack/react-query'

import { patchJson, postJson } from '@/lib/api-client'

/**
 * POST to `/api/campaigns/:campaignId/content/:routeKey`.
 *
 * The backend endpoint is **stubbed/deferred** — it returns a 501 for now.
 * The client sends the correct shape so wiring real persistence in Phase 5
 * only requires the backend, not the frontend.
 */
export async function createContent<T>(
  campaignId: string,
  routeKey: string,
  input: unknown,
  fallbackMessage?: string,
): Promise<T> {
  const body = await postJson<Record<string, T>>(
    `/api/campaigns/${campaignId}/content/${routeKey}`,
    input,
    fallbackMessage ?? `Could not create ${routeKey}.`,
  )
  const [entity] = Object.values(body)
  return entity as T
}

/**
 * PATCH to `/api/campaigns/:campaignId/content/:routeKey/:entityId`.
 *
 * Also **stubbed/deferred** — see `createContent` for the same caveat.
 */
export async function updateContent<T>(
  campaignId: string,
  routeKey: string,
  entityId: string,
  input: unknown,
  fallbackMessage?: string,
): Promise<T> {
  const body = await patchJson<Record<string, T>>(
    `/api/campaigns/${campaignId}/content/${routeKey}/${entityId}`,
    input,
    fallbackMessage ?? `Could not update ${routeKey}.`,
  )
  const [entity] = Object.values(body)
  return entity as T
}

/** Placeholder type so ContentFormDef can reference the list query shape generically. */
export type ContentListQueryResult<T> = Pick<UseQueryResult<T[]>, 'data' | 'isPending' | 'isError'>
