import type { UseQueryResult } from '@tanstack/react-query'

import { patchJson, postJson } from '@/lib/api-client'

/**
 * POST to `/api/campaigns/:campaignId/content/:routeKey`.
 * PATCH to `/api/campaigns/:campaignId/content/:routeKey/:entityId`.
 *
 * Creates homebrew records or upserts overlay patches on system content.
 * Requires owner/co-owner campaign role.
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
 * Updates homebrew records or upserts overlay patches on system content.
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
