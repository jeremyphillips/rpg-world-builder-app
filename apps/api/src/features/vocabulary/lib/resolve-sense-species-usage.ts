import type { Species } from '@rpg/contracts'

import { speciesWriteConfig } from '../../content/species/species.config'

import { extractSpeciesSenseTypeIdsFromRecord } from './reference-sources/species'
import {
  resolveCatalogVocabUsage,
  resolveCatalogVocabUsageBatch,
} from './resolve-catalog-vocab-usage'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'
import type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'

function speciesSenseUsageConfig() {
  return {
    readConfig: speciesWriteConfig.readConfig,
    contentTypeKey: 'species' as const,
    extractIds: (record: Species) => extractSpeciesSenseTypeIdsFromRecord(record),
  }
}

export async function resolveSenseSpeciesUsageBatch(
  ctx: VocabularyUsageResolverContext,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  return resolveCatalogVocabUsageBatch(ctx, speciesSenseUsageConfig(), entryIds)
}

export async function resolveSenseSpeciesUsage(
  ctx: VocabularyUsageResolverContext,
  entryId: string,
): Promise<{ count: number; blockers: import('@rpg/contracts').ContentUsageBlocker[] }> {
  return resolveCatalogVocabUsage(ctx, speciesSenseUsageConfig(), entryId)
}
