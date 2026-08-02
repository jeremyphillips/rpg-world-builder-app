import type { ApiContentTypeKey, ContentUsageBlocker } from '@rpg/contracts'

import type { ContentTypeConfig } from '../../content/lib/content-type-config'

import { loadCatalogBlockerIndex } from './resolve-catalog-vocab-usage'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'

type CatalogRecord = {
  id: string
  name: string
  slug: string
}

export type CatalogVocabularyUsageSourceConfig<T extends CatalogRecord> = {
  readConfig: ContentTypeConfig<T>
  contentTypeKey: ApiContentTypeKey
  extractIds: (record: T) => readonly string[]
}

/** Loads a catalog-backed blocker index for one reference source. */
export type VocabularyUsageSource = {
  loadBlockerIndex: (
    ctx: VocabularyUsageResolverContext,
  ) => Promise<Map<string, ContentUsageBlocker[]>>
}

export function catalogVocabularyUsageSource<T extends CatalogRecord>(
  config: CatalogVocabularyUsageSourceConfig<T>,
): VocabularyUsageSource {
  return {
    loadBlockerIndex: (ctx) => loadCatalogBlockerIndex(ctx.campaignId, config),
  }
}
