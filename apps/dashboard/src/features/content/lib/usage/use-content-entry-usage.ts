import { useQuery } from '@tanstack/react-query'
import type { ContentEntryUsage } from '@rpg/contracts'

import { request } from '@/lib/api-client'

/** Informational usage references for a content entity. */
export async function fetchContentEntryUsage(
  campaignId: string,
  routeKey: string,
  entityId: string,
): Promise<ContentEntryUsage> {
  const { usage } = await request<{ usage: ContentEntryUsage }>(
    `/api/campaigns/${campaignId}/content/${routeKey}/${entityId}/usage`,
    undefined,
    'Could not load content usage.',
  )
  return usage
}

export function contentEntryUsageQueryKey(campaignId: string, routeKey: string, entityId: string) {
  return ['campaigns', campaignId, 'content', routeKey, entityId, 'usage'] as const
}

export function useContentEntryUsage(
  campaignId: string | undefined,
  routeKey: string | undefined,
  entityId: string | undefined,
) {
  return useQuery({
    queryKey:
      campaignId && routeKey && entityId
        ? contentEntryUsageQueryKey(campaignId, routeKey, entityId)
        : [],
    queryFn: () => fetchContentEntryUsage(campaignId!, routeKey!, entityId!),
    enabled: Boolean(campaignId && routeKey && entityId),
  })
}
