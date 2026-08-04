import type { ContentUsageBlocker, VocabularyUsageReference } from '@rpg/contracts'
import { isSourceKeyedUsageBlocker } from '@rpg/contracts'

/** Maps operation blockers to neutral references for shared list rendering. */
export function contentUsageBlockersToUsageReferences(
  blockers: ContentUsageBlocker[],
): VocabularyUsageReference[] {
  const references: VocabularyUsageReference[] = []

  for (const blocker of blockers) {
    if (blocker.kind === 'content') {
      references.push({
        kind: 'content',
        contentTypeKey: blocker.contentTypeKey,
        id: blocker.id,
        label: blocker.label,
        slug: blocker.slug,
      })
      continue
    }

    if (blocker.kind === 'usage') {
      references.push({
        kind: 'character',
        id: blocker.usage.id,
        label: blocker.usage.label,
        characterType: blocker.usage.characterType,
        campaignId: blocker.usage.campaignId,
      })
    }
  }

  return references
}

export function partitionRuleBlockers(blockers: ContentUsageBlocker[]): {
  usageBlockers: ContentUsageBlocker[]
  references: VocabularyUsageReference[]
  ruleBlockers: Extract<ContentUsageBlocker, { kind: 'rule' }>[]
} {
  const usageBlockers: ContentUsageBlocker[] = []
  const ruleBlockers: Extract<ContentUsageBlocker, { kind: 'rule' }>[] = []

  for (const blocker of blockers) {
    if (isSourceKeyedUsageBlocker(blocker)) {
      usageBlockers.push(blocker)
      continue
    }

    if (blocker.kind === 'rule') {
      ruleBlockers.push(blocker)
    }
  }

  return {
    usageBlockers,
    references: contentUsageBlockersToUsageReferences(usageBlockers),
    ruleBlockers,
  }
}
