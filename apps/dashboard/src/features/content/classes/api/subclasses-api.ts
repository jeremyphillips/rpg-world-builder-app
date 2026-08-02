import type {
  ContentDeletionAvailability,
  ContentDeletionResult,
  ContentEntryUsage,
  ContentListUsageFields,
  ContentOverviewUsageScope,
  ContentUsageSummaryLabels,
  CreateSubclassInput,
  ResolvedSubclass,
  Subclass,
  UpdateSubclassInput,
} from '@rpg/contracts'
import {
  ApiError,
  contentDeletionAvailabilitySchema,
  contentDeletionResultSchema,
  fetchCsrfToken,
} from '@rpg/contracts'

import { CSRF_HEADER, patchJson, postJson, request } from '@/lib/api-client'

export type SubclassListRow = ResolvedSubclass & ContentListUsageFields

export type SubclassesListResult = {
  subclasses: SubclassListRow[]
  usageSummaryLabels?: ContentUsageSummaryLabels
  overviewUsageScope?: ContentOverviewUsageScope
}

export async function fetchSubclasses(
  campaignId: string,
  classId: string,
): Promise<SubclassesListResult> {
  const body = await request<{
    subclasses: SubclassListRow[]
    usageSummaryLabels?: ContentUsageSummaryLabels
    overviewUsageScope?: ContentOverviewUsageScope
  }>(
    `/api/campaigns/${campaignId}/content/classes/${classId}/subclasses`,
    undefined,
    'Could not load subclasses.',
  )

  return {
    subclasses: body.subclasses,
    ...(body.usageSummaryLabels ? { usageSummaryLabels: body.usageSummaryLabels } : {}),
    ...(body.overviewUsageScope ? { overviewUsageScope: body.overviewUsageScope } : {}),
  }
}

/** Informational usage references for a nested subclass. */
export async function fetchSubclassUsage(
  campaignId: string,
  classId: string,
  subclassId: string,
): Promise<ContentEntryUsage> {
  const { usage } = await request<{ usage: ContentEntryUsage }>(
    `/api/campaigns/${campaignId}/content/classes/${classId}/subclasses/${subclassId}/usage`,
    undefined,
    'Could not load subclass usage.',
  )
  return usage
}

export async function createSubclass(
  campaignId: string,
  classId: string,
  input: CreateSubclassInput,
): Promise<Subclass> {
  const body = await postJson<{ subclasses: Subclass }>(
    `/api/campaigns/${campaignId}/content/classes/${classId}/subclasses`,
    input,
    'Could not create subclass.',
  )
  return body.subclasses
}

export async function updateSubclass(
  campaignId: string,
  classId: string,
  subclassId: string,
  input: UpdateSubclassInput,
): Promise<Subclass> {
  const body = await patchJson<{ subclasses: Subclass }>(
    `/api/campaigns/${campaignId}/content/classes/${classId}/subclasses/${subclassId}`,
    input,
    'Could not update subclass.',
  )
  return body.subclasses
}

export async function fetchSubclassDeletionAvailability(
  campaignId: string,
  classId: string,
  subclassId: string,
): Promise<ContentDeletionAvailability> {
  const csrfToken = await fetchCsrfToken()
  const res = await fetch(
    `/api/campaigns/${campaignId}/content/classes/${classId}/subclasses/${subclassId}/deletion-availability`,
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
      body?.error?.message ?? 'Could not check whether this subclass can be deleted.',
    )
  }
  return contentDeletionAvailabilitySchema.parse(body?.availability)
}

export async function deleteSubclass(
  campaignId: string,
  classId: string,
  subclassId: string,
): Promise<ContentDeletionResult> {
  const csrfToken = await fetchCsrfToken()
  const res = await fetch(
    `/api/campaigns/${campaignId}/content/classes/${classId}/subclasses/${subclassId}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: { [CSRF_HEADER]: csrfToken },
    },
  )
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
    body?.error?.message ?? 'Could not delete subclass.',
  )
}
