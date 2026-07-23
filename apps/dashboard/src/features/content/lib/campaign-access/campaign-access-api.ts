import {
  ApiError,
  contentCampaignAccessAvailabilitySchema,
  contentCampaignAccessUpdateResultSchema,
  fetchCsrfToken,
  type ContentAccessTargetType,
  type ContentCampaignAccessPatch,
} from '@rpg/contracts'

import { CSRF_HEADER } from '@/lib/api-client'

async function parseCampaignAccessAvailabilityResponse(res: Response, fallbackMessage: string) {
  const body = (await res.json().catch(() => null)) as {
    availability?: unknown
    error?: { code?: string; message?: string }
  } | null
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error?.code ?? 'request_error',
      body?.error?.message ?? fallbackMessage,
    )
  }
  return contentCampaignAccessAvailabilitySchema.parse(body?.availability)
}

async function parseCampaignAccessUpdateResponse(res: Response, fallbackMessage: string) {
  const body = (await res.json().catch(() => null)) as {
    result?: unknown
    error?: { code?: string; message?: string }
  } | null

  if (res.status === 200 || res.status === 409) {
    return contentCampaignAccessUpdateResultSchema.parse(body?.result)
  }

  throw new ApiError(
    res.status,
    body?.error?.code ?? 'request_error',
    body?.error?.message ?? fallbackMessage,
  )
}

function contentCampaignAccessPath(
  campaignId: string,
  targetType: ContentAccessTargetType,
  entityId: string,
  suffix: 'campaign-access' | 'campaign-access-availability',
  classId?: string,
): string {
  if (targetType === 'subclasses') {
    if (!classId) {
      throw new Error('classId is required when targetType is subclasses.')
    }
    return `/api/campaigns/${campaignId}/content/classes/${classId}/subclasses/${entityId}/${suffix}`
  }

  return `/api/campaigns/${campaignId}/content/${targetType}/${entityId}/${suffix}`
}

export async function fetchContentCampaignAccessAvailability(
  campaignId: string,
  targetType: ContentAccessTargetType,
  entityId: string,
  options?: { classId?: string; fallbackMessage?: string },
) {
  const csrfToken = await fetchCsrfToken()
  const res = await fetch(
    contentCampaignAccessPath(
      campaignId,
      targetType,
      entityId,
      'campaign-access-availability',
      options?.classId,
    ),
    {
      credentials: 'include',
      headers: { [CSRF_HEADER]: csrfToken },
    },
  )

  return parseCampaignAccessAvailabilityResponse(
    res,
    options?.fallbackMessage ?? 'Could not check campaign access availability.',
  )
}

export async function updateContentCampaignAccess(
  campaignId: string,
  targetType: ContentAccessTargetType,
  entityId: string,
  input: ContentCampaignAccessPatch,
  options?: { classId?: string; fallbackMessage?: string },
) {
  const csrfToken = await fetchCsrfToken()
  const res = await fetch(
    contentCampaignAccessPath(
      campaignId,
      targetType,
      entityId,
      'campaign-access',
      options?.classId,
    ),
    {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        [CSRF_HEADER]: csrfToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    },
  )

  return parseCampaignAccessUpdateResponse(
    res,
    options?.fallbackMessage ?? 'Could not update campaign access.',
  )
}

/** Convenience wrapper for standard content types keyed by route key. */
export async function updateRouteContentCampaignAccess(
  campaignId: string,
  routeKey: string,
  entityId: string,
  input: ContentCampaignAccessPatch,
  fallbackMessage?: string,
) {
  return updateContentCampaignAccess(
    campaignId,
    routeKey as ContentAccessTargetType,
    entityId,
    input,
    { fallbackMessage },
  )
}
