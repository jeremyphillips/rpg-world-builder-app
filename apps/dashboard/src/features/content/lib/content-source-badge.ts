import type { SourceBadgeMap } from '@/lib/data-table/column-builders'

export type ContentSource = 'system' | 'homebrew'

export const CONTENT_SOURCE_BADGE = {
  system: { variant: 'secondary', label: 'System' },
  homebrew: { variant: 'outline', label: 'Homebrew' },
} as const satisfies SourceBadgeMap<ContentSource>
