import type { ApiContentTypeKey, ContentUsageBlocker } from '@rpg/contracts'
import { USAGE_BLOCKER_SOURCE_KEYS } from '@rpg/contracts'

import type { ContentTypeConfig } from '../../content/lib/content-type-config'
import { resolveCatalogForCampaign } from '../../content/content.service'

import {
  blockersForVocabEntry,
  indexRecordsByVocabId,
  mergeBlockerIndexes,
} from './reference-sources/index-by-vocab-id'
import { toContentUsageBlocker } from './reference-sources/content-referrer'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'
import {
  buildVocabularyBatchUsageEntryResult,
  buildVocabularyBatchUsageResults,
  type VocabularyBatchUsageEntryResult,
} from './build-vocabulary-batch-entry-result'

type CatalogRecord = {
  id: string
  name: string
  slug: string
}

type CatalogVocabUsageConfig<T extends CatalogRecord> = {
  readConfig: ContentTypeConfig<T>
  contentTypeKey: ApiContentTypeKey
  extractIds: (record: T) => readonly string[]
}

async function loadCatalogBlockerIndex<T extends CatalogRecord>(
  campaignId: string,
  config: CatalogVocabUsageConfig<T>,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const records = await resolveCatalogForCampaign(config.readConfig, campaignId)
  return indexRecordsByVocabId(records, config.extractIds, (record) =>
    toContentUsageBlocker(config.contentTypeKey, record, USAGE_BLOCKER_SOURCE_KEYS.unknown),
  )
}

export async function resolveCatalogVocabUsage<T extends CatalogRecord>(
  ctx: VocabularyUsageResolverContext,
  config: CatalogVocabUsageConfig<T>,
  entryId: string,
): Promise<{ count: number; blockers: ContentUsageBlocker[] }> {
  const index = await loadCatalogBlockerIndex(ctx.campaignId, config)
  const blockers = blockersForVocabEntry(index, entryId)
  return { count: blockers.length, blockers }
}

export async function resolveCatalogVocabUsageBatch<T extends CatalogRecord>(
  ctx: VocabularyUsageResolverContext,
  config: CatalogVocabUsageConfig<T>,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  const index = await loadCatalogBlockerIndex(ctx.campaignId, config)
  return buildVocabularyBatchUsageResults(
    entryIds,
    new Map(entryIds.map((entryId) => [entryId, blockersForVocabEntry(index, entryId)])),
  )
}

export async function resolveComposedVocabUsage(
  _ctx: VocabularyUsageResolverContext,
  indexes: readonly Map<string, ContentUsageBlocker[]>[],
  entryId: string,
): Promise<{ count: number; blockers: ContentUsageBlocker[] }> {
  const merged = mergeBlockerIndexes(indexes)
  const blockers = blockersForVocabEntry(merged, entryId)
  return { count: blockers.length, blockers }
}

export async function resolveComposedVocabUsageBatch(
  _ctx: VocabularyUsageResolverContext,
  indexes: readonly Map<string, ContentUsageBlocker[]>[],
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  const merged = mergeBlockerIndexes(indexes)
  return buildVocabularyBatchUsageResults(
    entryIds,
    new Map(entryIds.map((entryId) => [entryId, blockersForVocabEntry(merged, entryId)])),
  )
}

export { loadCatalogBlockerIndex, mergeBlockerIndexes, blockersForVocabEntry }

export function toBatchResultFromBlockers(
  blockers: ContentUsageBlocker[],
): VocabularyBatchUsageEntryResult {
  return buildVocabularyBatchUsageEntryResult(blockers)
}
