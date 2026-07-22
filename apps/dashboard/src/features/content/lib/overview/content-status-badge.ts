import type { ContentStatus } from '@rpg/contracts'
import type { SourceBadgeMap } from '@/lib/data-table/column-builders'

export const CONTENT_STATUS_BADGE = {
  draft: { appearance: 'outline', tone: 'warning', label: 'Draft' },
  published: { appearance: 'outline', tone: 'success', label: 'Published' },
} as const satisfies SourceBadgeMap<ContentStatus>
