import {
  ApiError,
  campaignAccessParticipantRosterSchema,
  contentCampaignAccessAvailabilityBatchResponseSchema,
  contentCampaignAccessAvailabilitySchema,
  contentCampaignAccessUpdateResultSchema,
  fetchCsrfToken,
  type ContentAccessTargetType,
  type ContentCampaignAccessAvailabilityBatchResponse,
  type ContentCampaignAccessPatch,
} from '@rpg/contracts'

import { postActionBatchValidate } from '@/lib/actions'

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

export type CampaignAccessRequestOptions = {
  classId?: string
  fallbackMessage?: string
  /** When set, skips `fetchCsrfToken()` — use for batched mutations sharing one token. */
  csrfToken?: string
}

async function resolveCsrfToken(provided?: string): Promise<string> {
  return provided ?? fetchCsrfToken()
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

function contentCampaignAccessBatchPath(
  campaignId: string,
  targetType: ContentAccessTargetType,
  classId?: string,
): string {
  if (targetType === 'subclasses') {
    if (!classId) {
      throw new Error('classId is required when targetType is subclasses.')
    }
    return `/api/campaigns/${campaignId}/content/classes/${classId}/subclasses/campaign-access-availability/batch`
  }

  return `/api/campaigns/${campaignId}/content/${targetType}/campaign-access-availability/batch`
}

export async function fetchCampaignAccessParticipantRoster(
  campaignId: string,
  options?: { fallbackMessage?: string; csrfToken?: string },
) {
  const csrfToken = await resolveCsrfToken(options?.csrfToken)
  const res = await fetch(`/api/campaigns/${campaignId}/content/access-participants`, {
    credentials: 'include',
    headers: { [CSRF_HEADER]: csrfToken },
  })

  const body = (await res.json().catch(() => null)) as {
    participants?: unknown
    error?: { code?: string; message?: string }
  } | null

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error?.code ?? 'request_error',
      body?.error?.message ?? options?.fallbackMessage ?? 'Could not load campaign players.',
    )
  }

  return campaignAccessParticipantRosterSchema.parse(body).participants
}

export async function fetchContentCampaignAccessAvailability(
  campaignId: string,
  targetType: ContentAccessTargetType,
  entityId: string,
  options?: CampaignAccessRequestOptions,
) {
  const csrfToken = await resolveCsrfToken(options?.csrfToken)
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

export async function fetchContentCampaignAccessAvailabilityBatch(
  campaignId: string,
  targetType: ContentAccessTargetType,
  entityIds: readonly string[],
  options?: CampaignAccessRequestOptions,
): Promise<ContentCampaignAccessAvailabilityBatchResponse> {
  const body = await postActionBatchValidate<{ targets: unknown }>({
    path: contentCampaignAccessBatchPath(campaignId, targetType, options?.classId),
    body: { targets: entityIds.map((entityId) => ({ entityId })) },
    fallbackMessage: options?.fallbackMessage ?? 'Could not check campaign access availability.',
  })

  return contentCampaignAccessAvailabilityBatchResponseSchema.parse(body)
}

export async function updateContentCampaignAccess(
  campaignId: string,
  targetType: ContentAccessTargetType,
  entityId: string,
  input: ContentCampaignAccessPatch,
  options?: CampaignAccessRequestOptions,
) {
  const csrfToken = await resolveCsrfToken(options?.csrfToken)
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
  options?: { fallbackMessage?: string; csrfToken?: string },
) {
  return updateContentCampaignAccess(
    campaignId,
    routeKey as ContentAccessTargetType,
    entityId,
    input,
    options,
  )
}
