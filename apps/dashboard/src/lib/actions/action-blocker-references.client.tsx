'use client'

import type { ContentUsageBlocker } from '@rpg/contracts'

import { UsageBlockedReferenceList } from '@/lib/usage-references/usage-blocked-reference-list.client'

const ACTION_BLOCKER_REFERENCE_DISCLOSURE_LIMIT = 5

export type ActionBlockerReferencesProps = {
  campaignId: string
  blockers: ContentUsageBlocker[]
  disclosureLimit?: number
}

/** Thin wrapper over usage reference rendering for action resolution rows. */
export function ActionBlockerReferences({
  campaignId,
  blockers,
  disclosureLimit = ACTION_BLOCKER_REFERENCE_DISCLOSURE_LIMIT,
}: ActionBlockerReferencesProps) {
  return (
    <UsageBlockedReferenceList
      campaignId={campaignId}
      blockers={blockers}
      disclosureLimit={disclosureLimit}
      defaultExpanded
    />
  )
}
