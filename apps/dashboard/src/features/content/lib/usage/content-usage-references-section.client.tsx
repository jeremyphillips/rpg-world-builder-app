'use client'

import { UsageReferencesQuerySection } from '@/lib/usage-references/usage-references-query-section.client'

import { useContentEntryUsage } from './use-content-entry-usage'

export type ContentUsageReferencesSectionProps = {
  campaignId: string
  routeKey: string
  entityId: string
}

/** Detail usage section for registered content surfaces — explicit query states. */
export function ContentUsageReferencesSection({
  campaignId,
  routeKey,
  entityId,
}: ContentUsageReferencesSectionProps) {
  const {
    data: usage,
    isPending,
    isError,
    refetch,
  } = useContentEntryUsage(campaignId, routeKey, entityId)

  return (
    <UsageReferencesQuerySection
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      onRetry={() => {
        void refetch()
      }}
      references={usage?.references}
    />
  )
}
