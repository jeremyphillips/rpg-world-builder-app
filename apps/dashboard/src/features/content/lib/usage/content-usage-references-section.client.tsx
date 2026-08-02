'use client'

import { UsageReferencesSection } from '@/lib/usage-references/usage-references-section.client'

import { useContentEntryUsage } from './use-content-entry-usage'

export type ContentUsageReferencesSectionProps = {
  campaignId: string
  routeKey: string
  entityId: string
}

/** Detail "Used by" section — mounts only when usage loads for a registered content surface. */
export function ContentUsageReferencesSection({
  campaignId,
  routeKey,
  entityId,
}: ContentUsageReferencesSectionProps) {
  const { data: usage } = useContentEntryUsage(campaignId, routeKey, entityId)

  if (!usage) {
    return null
  }

  return <UsageReferencesSection campaignId={campaignId} references={usage.references} />
}
