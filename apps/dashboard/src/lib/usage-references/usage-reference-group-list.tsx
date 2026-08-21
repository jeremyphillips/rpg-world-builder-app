import { useState } from 'react'
import { Button, Text } from '@rpg/ui'
import { ChevronDown } from 'lucide-react'
import type { VocabularyUsageReference } from '@rpg/contracts'

import { UsageReferenceRow } from './usage-reference-row'
import { usageReferenceRowListClasses } from './usage-reference-list.lib'

export type UsageReferenceGroupListProps = {
  campaignId: string
  groups: Array<{
    key: string
    label: string
    count: number
    references: VocabularyUsageReference[]
  }>
  disclosureLimit: number
  defaultExpanded?: boolean
}

function UsageReferenceGroupItems({
  campaignId,
  references,
  disclosureLimit,
}: {
  campaignId: string
  references: VocabularyUsageReference[]
  disclosureLimit: number
}) {
  const [showAll, setShowAll] = useState(false)
  const visibleReferences = showAll ? references : references.slice(0, disclosureLimit)
  const remainingCount = references.length - disclosureLimit

  return (
    <ul className={usageReferenceRowListClasses} role="list">
      {visibleReferences.map((reference) => (
        <li key={`${reference.kind}:${reference.id}`}>
          <UsageReferenceRow reference={reference} campaignId={campaignId} />
        </li>
      ))}
      {references.length > disclosureLimit ? (
        <li className="list-none">
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto px-0"
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? 'Show fewer' : `Show remaining ${remainingCount}`}
          </Button>
        </li>
      ) : null}
    </ul>
  )
}

/** Expandable grouped usage reference list — shared by informational and blocked surfaces. */
export function UsageReferenceGroupList({
  campaignId,
  groups,
  disclosureLimit,
  defaultExpanded = false,
}: UsageReferenceGroupListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
    defaultExpanded ? Object.fromEntries(groups.map((group) => [group.key, true])) : {},
  )

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        const expanded = expandedGroups[group.key] ?? false

        return (
          <section key={group.key} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Text variant="small" className="font-medium text-foreground">
                {group.label} · {group.count}
              </Text>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto gap-1 px-0 text-primary"
                aria-expanded={expanded}
                onClick={() =>
                  setExpandedGroups((current) => ({
                    ...current,
                    [group.key]: !expanded,
                  }))
                }
              >
                {expanded ? 'Hide' : 'Show'}
                <ChevronDown
                  aria-hidden
                  className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                />
              </Button>
            </div>
            {expanded ? (
              <UsageReferenceGroupItems
                campaignId={campaignId}
                references={group.references}
                disclosureLimit={disclosureLimit}
              />
            ) : null}
          </section>
        )
      })}
    </div>
  )
}
