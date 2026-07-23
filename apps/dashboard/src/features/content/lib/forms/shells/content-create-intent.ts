import type { ContentStatus } from '@rpg/contracts'

export type ContentCreateIntent = 'save_draft' | 'publish'

export function intentToStatus(intent: ContentCreateIntent): ContentStatus {
  return intent === 'save_draft' ? 'draft' : 'published'
}
