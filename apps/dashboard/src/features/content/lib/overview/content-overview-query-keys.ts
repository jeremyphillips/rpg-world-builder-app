import type { ContentTypeKey } from '@rpg/contracts'

/** Shared list query key for overview tables and duplicate invalidation. */
export function contentOverviewListQueryKey(
  campaignId: string,
  contentTypeKey: ContentTypeKey,
): readonly ['campaigns', string, 'content', ContentTypeKey] {
  return ['campaigns', campaignId, 'content', contentTypeKey] as const
}
