import type { ApiContentTypeKey, ContentUsageBlocker } from '@rpg/contracts'

type ContentRecord = {
  id: string
  name: string
  slug: string
}

export function toContentUsageBlocker(
  contentTypeKey: ApiContentTypeKey,
  record: ContentRecord,
): ContentUsageBlocker {
  return {
    kind: 'content',
    contentTypeKey,
    id: record.id,
    label: record.name,
    slug: record.slug,
  }
}
