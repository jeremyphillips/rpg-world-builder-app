'use client'

import { Heading, Text } from '@rpg/ui'
import type { VocabularyUsageReference } from '@rpg/contracts'

import {
  countUsageReferenceGroups,
  formatUsageReferencesSummary,
  groupUsageReferences,
} from '@/lib/usage-references/group-usage-references'

import { VOCABULARY_USAGE_REFERENCE_DISCLOSURE_LIMIT } from '@/features/homebrew/lib/vocabulary/usage-references.constants'
import { UsageReferenceGroupList } from './usage-reference-group-list.client'

export type UsageReferencesSectionProps = {
  campaignId: string
  references: VocabularyUsageReference[]
  disclosureLimit?: number
}

/** Informational "Used by" section for vocabulary entry edit surfaces. */
export function UsageReferencesSection({
  campaignId,
  references,
  disclosureLimit = VOCABULARY_USAGE_REFERENCE_DISCLOSURE_LIMIT,
}: UsageReferencesSectionProps) {
  const usedBy = references.length
  const groupCount = countUsageReferenceGroups(references)
  const summary = formatUsageReferencesSummary(usedBy, groupCount)
  const groups = groupUsageReferences(references)

  return (
    <section
      aria-labelledby="usage-references-heading"
      className="space-y-3 border-t border-border-subtle pt-6"
    >
      <div className="space-y-1">
        <Heading variant="group" as="h3" id="usage-references-heading">
          Used by
        </Heading>
        <Text variant="muted" className="text-sm">
          {summary}
        </Text>
      </div>

      {usedBy > 0 ? (
        <UsageReferenceGroupList
          campaignId={campaignId}
          groups={groups}
          disclosureLimit={disclosureLimit}
        />
      ) : null}
    </section>
  )
}
