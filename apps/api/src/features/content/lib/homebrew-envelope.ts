import type { ContentStatus } from '@rpg/contracts'

import type { HomebrewDoc } from './content-write-config'

/** Maps shared Mongo homebrew identity fields to the catalog envelope shape. */
export function homebrewContentEnvelope(doc: HomebrewDoc) {
  return {
    id: String(doc._id),
    slug: doc.slug,
    rulesetId: doc.rulesetId,
    source: 'homebrew' as const,
    campaignId: doc.campaignId,
    status: (doc.status as ContentStatus | undefined) ?? 'published',
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}
