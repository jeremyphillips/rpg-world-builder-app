import type { ContentOverviewUsageScope, ContentUsageSummaryLabels } from '@rpg/contracts'

import {
  attachContentUsageCounts,
  CONTENT_USAGE_REGISTRATIONS,
  type ContentUsageSurfaceKey,
} from './content-usage-resolvers'
import { attachViewerCharacterRelationships } from './resolve-viewer-character-relationships'
import type { ContentUsageResolverContext } from './content-usage-context'

export type ContentListUsageEnvelope<T> = {
  items: T[]
  usageSummaryLabels?: ContentUsageSummaryLabels
  overviewUsageScope?: ContentOverviewUsageScope
}

/** Attach batch usage counts and overview metadata when the surface registers batch sources. */
export async function buildContentListUsageEnvelope<T extends { id: string; slug: string }>(
  ctx: ContentUsageResolverContext,
  contentType: ContentUsageSurfaceKey,
  items: readonly T[],
): Promise<ContentListUsageEnvelope<T>> {
  const registration = CONTENT_USAGE_REGISTRATIONS[contentType]
  const hasBatch = registration?.sources.some((source) => source.batch) ?? false

  if (!hasBatch || !registration) {
    return { items: [...items] }
  }

  const withUsage = await attachContentUsageCounts(ctx, contentType, items)
  const withRelationships = await attachViewerCharacterRelationships(ctx, contentType, withUsage)
  return {
    items: withRelationships,
    usageSummaryLabels: registration.summaryLabels,
    overviewUsageScope: registration.overviewUsageScope,
  }
}
