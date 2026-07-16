import type { SourceBadgeMap } from '@/lib/data-table/column-builders'

export type ContentSource = 'system' | 'homebrew'

export const CONTENT_SOURCE_BADGE = {
  system: { appearance: 'neutral', tone: 'neutral', label: 'System' },
  homebrew: { appearance: 'outline', tone: 'neutral', label: 'Homebrew' },
} as const satisfies SourceBadgeMap<ContentSource>
