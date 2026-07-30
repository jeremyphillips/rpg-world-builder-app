import type { ContentTypeKey, VocabularyUsageReference } from '@rpg/contracts'

import { getContentTypeCollectionLabel } from '@/features/content/lib/content-type-labels'

export const USAGE_REFERENCE_CHARACTER_GROUP_KEY = 'character' as const

export type UsageReferenceGroupKey = ContentTypeKey | typeof USAGE_REFERENCE_CHARACTER_GROUP_KEY

export type UsageReferenceGroup = {
  key: UsageReferenceGroupKey
  label: string
  count: number
  references: VocabularyUsageReference[]
}

const USAGE_REFERENCE_CHARACTER_GROUP_LABEL = 'Characters'

function resolveUsageReferenceGroupKey(
  reference: VocabularyUsageReference,
): UsageReferenceGroupKey {
  return reference.kind === 'content'
    ? reference.contentTypeKey
    : USAGE_REFERENCE_CHARACTER_GROUP_KEY
}

function resolveUsageReferenceGroupLabel(key: UsageReferenceGroupKey): string {
  if (key === USAGE_REFERENCE_CHARACTER_GROUP_KEY) {
    return USAGE_REFERENCE_CHARACTER_GROUP_LABEL
  }

  return getContentTypeCollectionLabel(key)
}

/** Partitions API-ordered references into groups without re-sorting. */
export function groupUsageReferences(
  references: VocabularyUsageReference[],
): UsageReferenceGroup[] {
  const groups: UsageReferenceGroup[] = []

  for (const reference of references) {
    const key = resolveUsageReferenceGroupKey(reference)
    const existing = groups.find((group) => group.key === key)

    if (existing) {
      existing.references.push(reference)
      existing.count += 1
      continue
    }

    groups.push({
      key,
      label: resolveUsageReferenceGroupLabel(key),
      count: 1,
      references: [reference],
    })
  }

  return groups
}

export function countUsageReferenceGroups(references: VocabularyUsageReference[]): number {
  return groupUsageReferences(references).length
}

export function formatUsageReferencesSummary(usedBy: number, groupCount: number): string {
  if (usedBy === 0) {
    return 'Not currently used by any content.'
  }

  const referenceLabel = usedBy === 1 ? 'reference' : 'references'
  const groupLabel = groupCount === 1 ? 'content type' : 'content types'

  return `${usedBy} ${referenceLabel} across ${groupCount} ${groupLabel}`
}
