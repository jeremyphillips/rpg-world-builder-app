import type { CharacterClass, Species } from '@rpg/contracts'

import { classContentConfig } from '../../content/classes/classes.config'
import { speciesWriteConfig } from '../../content/species/species.config'

import { extractClassLanguageIds } from './reference-sources/classes'
import { indexCharacterLanguageBlockersByLanguageId } from './reference-sources/characters-languages'
import { extractSpeciesLanguageIdsFromRecord } from './reference-sources/species'
import {
  loadCatalogBlockerIndex,
  resolveComposedVocabUsage,
  resolveComposedVocabUsageBatch,
} from './resolve-catalog-vocab-usage'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'
import type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'

async function loadLanguageBlockerIndexes(ctx: VocabularyUsageResolverContext) {
  const [speciesIndex, classIndex, characterIndex] = await Promise.all([
    loadCatalogBlockerIndex(ctx.campaignId, {
      readConfig: speciesWriteConfig.readConfig,
      contentTypeKey: 'species',
      extractIds: (record: Species) => extractSpeciesLanguageIdsFromRecord(record),
    }),
    loadCatalogBlockerIndex(ctx.campaignId, {
      readConfig: classContentConfig,
      contentTypeKey: 'classes',
      extractIds: (record: CharacterClass) => extractClassLanguageIds(record),
    }),
    indexCharacterLanguageBlockersByLanguageId({
      campaignId: ctx.campaignId,
      viewer: ctx.viewer,
    }),
  ])

  return [speciesIndex, classIndex, characterIndex] as const
}

export async function resolveLanguageUsageBatch(
  ctx: VocabularyUsageResolverContext,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  const indexes = await loadLanguageBlockerIndexes(ctx)
  return resolveComposedVocabUsageBatch(ctx, indexes, entryIds)
}

export async function resolveLanguageUsage(
  ctx: VocabularyUsageResolverContext,
  entryId: string,
): Promise<{ count: number; blockers: import('@rpg/contracts').ContentUsageBlocker[] }> {
  const indexes = await loadLanguageBlockerIndexes(ctx)
  return resolveComposedVocabUsage(ctx, indexes, entryId)
}
