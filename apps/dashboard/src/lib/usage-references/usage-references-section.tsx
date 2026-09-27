import { Heading, Text } from '@rpg/ui'
import type { VocabularyUsageReference } from '@rpg/contracts'

import {
  countUsageReferenceGroups,
  formatUsageReferencesSummary,
  groupUsageReferences,
} from '@/lib/usage-references/group-usage-references'

import { USAGE_REFERENCE_DISCLOSURE_LIMIT } from '@/lib/usage-references/constants'
import { UsageReferenceGroupList } from './usage-reference-group-list'

export type UsageReferencesSectionProps = {
  campaignId: string
  references: VocabularyUsageReference[]
  disclosureLimit?: number
  /** When true, section content is visible on load (nested groups remain collapsed). */
  defaultOpen?: boolean
  /** When true, parent chrome owns the section heading. */
  embedded?: boolean
}

/** Informational "Used by" section for vocabulary entry surfaces. */
export function UsageReferencesSection({
  campaignId,
  references,
  disclosureLimit = USAGE_REFERENCE_DISCLOSURE_LIMIT,
  defaultOpen: _defaultOpen = false,
  embedded = false,
}: UsageReferencesSectionProps) {
  const usedBy = references.length
  const groupCount = countUsageReferenceGroups(references)
  const summary = formatUsageReferencesSummary(usedBy, groupCount)
  const groups = groupUsageReferences(references)

  const body = (
    <>
      <div className="space-y-1">
        {!embedded ? (
          <Heading variant="group" as="h3" id="usage-references-heading">
            Used by
          </Heading>
        ) : null}
        <Text variant="muted" className="text-sm">
          {summary}
        </Text>
      </div>

      {usedBy > 0 ? (
        <UsageReferenceGroupList
          campaignId={campaignId}
          groups={groups}
          disclosureLimit={disclosureLimit}
          defaultExpanded={false}
        />
      ) : null}
    </>
  )

  if (embedded) {
    return <div className="space-y-3 px-4 py-2">{body}</div>
  }

  return (
    <section
      aria-labelledby="usage-references-heading"
      className="space-y-3 border-t border-border-subtle pt-6"
    >
      {body}
    </section>
  )
}
