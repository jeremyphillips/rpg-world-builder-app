import type { Species } from '@rpg/contracts'

import { speciesWriteConfig } from '../../content/species/species.config'

import { extractSpeciesSizeIds } from './reference-sources/species'
import {
  resolveCatalogVocabUsage,
  resolveCatalogVocabUsageBatch,
} from './resolve-catalog-vocab-usage'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'
import type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'

function speciesSizeUsageConfig() {
  return {
    readConfig: speciesWriteConfig.readConfig,
    contentTypeKey: 'species' as const,
    extractIds: (record: Species) => extractSpeciesSizeIds(record),
  }
}

export async function resolveSizeSpeciesUsageBatch(
  ctx: VocabularyUsageResolverContext,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  return resolveCatalogVocabUsageBatch(ctx, speciesSizeUsageConfig(), entryIds)
}

export async function resolveSizeSpeciesUsage(
  ctx: VocabularyUsageResolverContext,
  entryId: string,
): Promise<{ count: number; blockers: import('@rpg/contracts').ContentUsageBlocker[] }> {
  return resolveCatalogVocabUsage(ctx, speciesSizeUsageConfig(), entryId)
}
