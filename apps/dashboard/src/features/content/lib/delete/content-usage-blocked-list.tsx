import type { ContentUsageBlocker } from '@rpg/contracts'

import { UsageBlockedList } from '@/lib/usage-blocked/usage-blocked-list'

export interface ContentUsageBlockedListProps {
  blockers: ContentUsageBlocker[]
  campaignId?: string
}

export function ContentUsageBlockedList({ blockers, campaignId }: ContentUsageBlockedListProps) {
  return <UsageBlockedList blockers={blockers} campaignId={campaignId} />
}
