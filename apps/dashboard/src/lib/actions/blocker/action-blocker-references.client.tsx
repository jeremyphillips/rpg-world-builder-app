'use client'

import { useState } from 'react'
import type { ContentUsageBlocker } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'
import { ChevronDown } from 'lucide-react'

import {
  groupUsageBlockersBySourceKey,
  type UsageBlockerSourceGroup,
} from '@/lib/usage-references/group-usage-blockers-by-source'
import { partitionRuleBlockers } from '@/lib/usage-references/map-content-usage-blockers'
import { UsageReferenceRow } from '@/lib/usage-references/usage-reference-row.client'

import {
  actionBlockedFlatPanelClasses,
  actionBlockerReferenceFlatListClasses,
  actionBlockerReferenceGroupClasses,
  actionBlockerReferenceRowListClasses,
  actionBlockerReferenceSummaryClasses,
  formatActionBlockedUsageGroupSummary,
} from './action-blocker-references.lib'

const ACTION_BLOCKER_REFERENCE_DISCLOSURE_LIMIT = 5

export type ActionBlockerReferencesVariant = 'grouped' | 'flat'

export type ActionBlockerReferencesProps = {
  campaignId: string
  blockers: ContentUsageBlocker[]
  disclosureLimit?: number
  /** Grouped summaries for bulk rows; flat bulleted links for single blocked dialogs. */
  variant?: ActionBlockerReferencesVariant
}

function ActionBlockerReferenceLinks({
  campaignId,
  references,
  disclosureLimit,
  listClassName,
}: {
  campaignId: string
  references: UsageBlockerSourceGroup['references']
  disclosureLimit: number
  listClassName: string
}) {
  const [showAll, setShowAll] = useState(false)
  const visibleReferences = showAll ? references : references.slice(0, disclosureLimit)
  const remainingCount = references.length - disclosureLimit

  return (
    <>
      <ul className={listClassName} role="list">
        {visibleReferences.map((reference) => (
          <li key={`${reference.kind}:${reference.id}`}>
            <UsageReferenceRow reference={reference} campaignId={campaignId} />
          </li>
        ))}
      </ul>
      {references.length > disclosureLimit ? (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto px-0 text-xs"
          onClick={() => setShowAll((current) => !current)}
        >
          {showAll ? 'Show fewer' : `Show remaining ${remainingCount}`}
        </Button>
      ) : null}
    </>
  )
}

function ActionBlockerReferenceGroup({
  campaignId,
  group,
  disclosureLimit,
  initiallyExpanded,
}: {
  campaignId: string
  group: UsageBlockerSourceGroup
  disclosureLimit: number
  initiallyExpanded: boolean
}) {
  const [expanded, setExpanded] = useState(initiallyExpanded)
  const summary = formatActionBlockedUsageGroupSummary({
    sourceKey: group.sourceKey,
    referenceCount: group.references.length,
  })

  if (initiallyExpanded) {
    return (
      <section className={actionBlockerReferenceGroupClasses}>
        <Text as="p" className={actionBlockerReferenceSummaryClasses}>
          {summary}
        </Text>
        <ActionBlockerReferenceLinks
          campaignId={campaignId}
          references={group.references}
          disclosureLimit={disclosureLimit}
          listClassName={actionBlockerReferenceRowListClasses}
        />
      </section>
    )
  }

  return (
    <section className={actionBlockerReferenceGroupClasses}>
      <div className="flex items-center justify-between gap-3">
        <Text as="p" className={actionBlockerReferenceSummaryClasses}>
          {summary}
        </Text>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto gap-1 px-0 text-primary"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? 'Hide' : 'Show'}
          <ChevronDown
            aria-hidden
            className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </Button>
      </div>
      {expanded ? (
        <ActionBlockerReferenceLinks
          campaignId={campaignId}
          references={group.references}
          disclosureLimit={disclosureLimit}
          listClassName={actionBlockerReferenceRowListClasses}
        />
      ) : null}
    </section>
  )
}

function ActionBlockerFlatReferences({
  campaignId,
  allReferences,
  ruleBlockers,
  disclosureLimit,
}: {
  campaignId: string
  allReferences: UsageBlockerSourceGroup['references']
  ruleBlockers: ReturnType<typeof partitionRuleBlockers>['ruleBlockers']
  disclosureLimit: number
}) {
  if (allReferences.length === 0 && ruleBlockers.length === 0) {
    return null
  }

  return (
    <div className={actionBlockedFlatPanelClasses}>
      {allReferences.length > 0 ? (
        <ActionBlockerReferenceLinks
          campaignId={campaignId}
          references={allReferences}
          disclosureLimit={disclosureLimit}
          listClassName={actionBlockerReferenceFlatListClasses}
        />
      ) : null}

      {ruleBlockers.length > 0 ? (
        <ul className={actionBlockerReferenceFlatListClasses} role="list">
          {ruleBlockers.map((blocker) => (
            <li key={blocker.code}>{blocker.message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** Blocked-reference list — grouped summaries for bulk rows; flat links for single blocked dialogs. */
export function ActionBlockerReferences({
  campaignId,
  blockers,
  disclosureLimit = ACTION_BLOCKER_REFERENCE_DISCLOSURE_LIMIT,
  variant = 'grouped',
}: ActionBlockerReferencesProps) {
  const { usageBlockers, ruleBlockers } = partitionRuleBlockers(blockers)
  const groups = groupUsageBlockersBySourceKey(usageBlockers)

  if (variant === 'flat') {
    return (
      <ActionBlockerFlatReferences
        campaignId={campaignId}
        allReferences={groups.flatMap((group) => group.references)}
        ruleBlockers={ruleBlockers}
        disclosureLimit={disclosureLimit}
      />
    )
  }

  return (
    <div className="space-y-2">
      {groups.map((group, index) => (
        <ActionBlockerReferenceGroup
          key={group.sourceKey}
          campaignId={campaignId}
          group={group}
          disclosureLimit={disclosureLimit}
          initiallyExpanded={index === 0}
        />
      ))}

      {ruleBlockers.length > 0 ? (
        <ul className={actionBlockerReferenceRowListClasses} role="list">
          {ruleBlockers.map((blocker) => (
            <li key={blocker.code}>{blocker.message}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
