import type { ContentInformationalUsageReference, ContentUsageBlocker } from '@rpg/contracts'

/** Maps resolver blockers to neutral usage references (informational GET). */
export function mapBlockersToContentUsageReferences(
  blockers: ContentUsageBlocker[],
): ContentInformationalUsageReference[] {
  const references: ContentInformationalUsageReference[] = []

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

/** Stable API ordering — content refs by type then label; character refs by label. */
export function sortContentUsageReferences(
  references: ContentInformationalUsageReference[],
): ContentInformationalUsageReference[] {
  const contentRefs = references.filter(
    (reference): reference is Extract<ContentInformationalUsageReference, { kind: 'content' }> =>
      reference.kind === 'content',
  )
  const characterRefs = references.filter(
    (reference): reference is Extract<ContentInformationalUsageReference, { kind: 'character' }> =>
      reference.kind === 'character',
  )

  contentRefs.sort((left, right) => {
    const typeCompare = left.contentTypeKey.localeCompare(right.contentTypeKey)
    if (typeCompare !== 0) {
      return typeCompare
    }
    return left.label.localeCompare(right.label)
  })

  characterRefs.sort((left, right) => left.label.localeCompare(right.label))

  return [...contentRefs, ...characterRefs]
}

export function buildContentEntryUsageFromBlockers(blockers: ContentUsageBlocker[]): {
  references: ContentInformationalUsageReference[]
  usedBy: number
} {
  const references = sortContentUsageReferences(mapBlockersToContentUsageReferences(blockers))
  return { references, usedBy: references.length }
}
