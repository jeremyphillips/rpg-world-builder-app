import { UsageReferencesQuerySection } from '@/lib/usage-references/usage-references-query-section'

import { ContentDetailSection } from '../detail/page/content-detail-section'
import { useContentEntryUsage } from './use-content-entry-usage'

export const CONTENT_USAGE_REFERENCES_HEADING_ID = 'usage-references-heading'

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
    <ContentDetailSection
      bodyLayout="list"
      heading="Used by"
      headingId={CONTENT_USAGE_REFERENCES_HEADING_ID}
    >
      <UsageReferencesQuerySection
        campaignId={campaignId}
        embedded
        isPending={isPending}
        isError={isError}
        onRetry={() => {
          void refetch()
        }}
        references={usage?.references}
      />
    </ContentDetailSection>
  )
}
