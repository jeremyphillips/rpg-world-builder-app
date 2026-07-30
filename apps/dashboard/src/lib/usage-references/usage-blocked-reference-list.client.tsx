'use client'

import { Text } from '@rpg/ui'
import type { ContentUsageBlocker } from '@rpg/contracts'

import { partitionRuleBlockers } from '@/lib/usage-references/map-content-usage-blockers'

import { groupUsageReferences } from './group-usage-references'
import { UsageReferenceGroupList } from './usage-reference-group-list.client'

export type UsageBlockedReferenceListProps = {
  campaignId: string
  blockers: ContentUsageBlocker[]
  disclosureLimit: number
  defaultExpanded?: boolean
}

/** Blocked-operation reference list — separate from informational usage section. */
export function UsageBlockedReferenceList({
  campaignId,
  blockers,
  disclosureLimit,
  defaultExpanded = true,
}: UsageBlockedReferenceListProps) {
  const { references, ruleBlockers } = partitionRuleBlockers(blockers)
  const groups = groupUsageReferences(references)

  return (
    <>
      {groups.length > 0 ? (
        <UsageReferenceGroupList
          campaignId={campaignId}
          groups={groups}
          disclosureLimit={disclosureLimit}
          defaultExpanded={defaultExpanded}
        />
      ) : null}

      {ruleBlockers.length > 0 ? (
        <ul className="space-y-2">
          {ruleBlockers.map((blocker) => (
            <li key={blocker.code}>
              <Text variant="small">{blocker.message}</Text>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}
