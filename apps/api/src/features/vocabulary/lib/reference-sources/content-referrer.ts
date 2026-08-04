import type { ApiContentTypeKey, ContentUsageBlocker, UsageBlockerSourceKey } from '@rpg/contracts'

type ContentRecord = {
  id: string
  name: string
  slug: string
}

export function toContentUsageBlocker(
  contentTypeKey: ApiContentTypeKey,
  record: ContentRecord,
  sourceKey: UsageBlockerSourceKey,
): ContentUsageBlocker {
  return {
    kind: 'content',
    sourceKey,
    contentTypeKey,
    id: record.id,
    label: record.name,
    slug: record.slug,
  }
}
