import type { UseQueryResult } from '@tanstack/react-query'

import {
  ApiError,
  contentDemotionAvailabilitySchema,
  contentDemotionResultSchema,
  contentDeletionAvailabilitySchema,
  contentDeletionResultSchema,
  fetchCsrfToken,
} from '@rpg/contracts'

import { CSRF_HEADER, patchJson, postJson } from '@/lib/api-client'

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

/** GET `/api/campaigns/:campaignId/content/:routeKey/:entityId/deletion-availability`. */
export async function getContentDeletionAvailability(
  campaignId: string,
  routeKey: string,
  entityId: string,
  fallbackMessage?: string,
): Promise<ReturnType<typeof contentDeletionAvailabilitySchema.parse>> {
  const csrfToken = await fetchCsrfToken()
  const res = await fetch(
    `/api/campaigns/${campaignId}/content/${routeKey}/${entityId}/deletion-availability`,
    {
      credentials: 'include',
      headers: { [CSRF_HEADER]: csrfToken },
    },
  )
  const body = (await res.json().catch(() => null)) as {
    availability?: unknown
    error?: { code?: string; message?: string }
  } | null
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error?.code ?? 'request_error',
      body?.error?.message ?? fallbackMessage ?? 'Could not check deletion availability.',
    )
  }
  return contentDeletionAvailabilitySchema.parse(body?.availability)
}

/** DELETE `/api/campaigns/:campaignId/content/:routeKey/:entityId`. Parses blocked 409 bodies. */
export async function deleteContent(
  campaignId: string,
  routeKey: string,
  entityId: string,
  fallbackMessage?: string,
): Promise<ReturnType<typeof contentDeletionResultSchema.parse>> {
  const csrfToken = await fetchCsrfToken()
  const res = await fetch(`/api/campaigns/${campaignId}/content/${routeKey}/${entityId}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: { [CSRF_HEADER]: csrfToken },
  })
  const body = (await res.json().catch(() => null)) as {
    result?: unknown
    error?: { code?: string; message?: string }
  } | null

  if (res.status === 200 || res.status === 409) {
    return contentDeletionResultSchema.parse(body?.result)
  }

  throw new ApiError(
    res.status,
    body?.error?.code ?? 'request_error',
    body?.error?.message ?? fallbackMessage ?? `Could not delete ${routeKey}.`,
  )
}

/** POST `/api/campaigns/:campaignId/content/:routeKey/:entityId/publish`. */
export async function publishContent<T>(
  campaignId: string,
  routeKey: string,
  entityId: string,
  fallbackMessage?: string,
): Promise<T> {
  const csrfToken = await fetchCsrfToken()
  const res = await fetch(`/api/campaigns/${campaignId}/content/${routeKey}/${entityId}/publish`, {
    method: 'POST',
    credentials: 'include',
    headers: { [CSRF_HEADER]: csrfToken },
  })
  const body = (await res.json().catch(() => null)) as Record<string, T> & {
    error?: { code?: string; message?: string }
  }
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error?.code ?? 'request_error',
      body?.error?.message ?? fallbackMessage ?? `Could not publish ${routeKey}.`,
    )
  }
  const [entity] = Object.values(body).filter((value) => value != null && typeof value === 'object')
  return entity as T
}

/** GET `/api/campaigns/:campaignId/content/:routeKey/:entityId/demotion-availability`. */
export async function getContentDemotionAvailability(
  campaignId: string,
  routeKey: string,
  entityId: string,
  fallbackMessage?: string,
): Promise<ReturnType<typeof contentDemotionAvailabilitySchema.parse>> {
  const csrfToken = await fetchCsrfToken()
  const res = await fetch(
    `/api/campaigns/${campaignId}/content/${routeKey}/${entityId}/demotion-availability`,
    {
      credentials: 'include',
      headers: { [CSRF_HEADER]: csrfToken },
    },
  )
  const body = (await res.json().catch(() => null)) as {
    availability?: unknown
    error?: { code?: string; message?: string }
  } | null
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error?.code ?? 'request_error',
      body?.error?.message ?? fallbackMessage ?? 'Could not check demotion availability.',
    )
  }
  return contentDemotionAvailabilitySchema.parse(body?.availability)
}

/** POST `/api/campaigns/:campaignId/content/:routeKey/:entityId/demote`. */
export async function demoteContent(
  campaignId: string,
  routeKey: string,
  entityId: string,
  fallbackMessage?: string,
): Promise<ReturnType<typeof contentDemotionResultSchema.parse>> {
  const csrfToken = await fetchCsrfToken()
  const res = await fetch(`/api/campaigns/${campaignId}/content/${routeKey}/${entityId}/demote`, {
    method: 'POST',
    credentials: 'include',
    headers: { [CSRF_HEADER]: csrfToken },
  })
  const body = (await res.json().catch(() => null)) as {
    result?: unknown
    error?: { code?: string; message?: string }
  } | null

  if (res.status === 200 || res.status === 409) {
    return contentDemotionResultSchema.parse(body?.result)
  }

  throw new ApiError(
    res.status,
    body?.error?.code ?? 'request_error',
    body?.error?.message ?? fallbackMessage ?? `Could not demote ${routeKey}.`,
  )
}

/** Placeholder type so ContentFormDef can reference the list query shape generically. */
export type ContentListQueryResult<T> = Pick<UseQueryResult<T[]>, 'data' | 'isPending' | 'isError'>
