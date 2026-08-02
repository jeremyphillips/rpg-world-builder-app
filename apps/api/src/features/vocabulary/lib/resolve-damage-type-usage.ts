import type { Species, Spell } from '@rpg/contracts'

import { speciesWriteConfig } from '../../content/species/species.config'
import { spellWriteConfig } from '../../content/spells/spells.config'

import { extractSpeciesDamageTypeIdsFromRecord } from './reference-sources/species'
import { extractSpellDamageTypeIds } from './reference-sources/spells'
import {
  loadCatalogBlockerIndex,
  resolveComposedVocabUsage,
  resolveComposedVocabUsageBatch,
} from './resolve-catalog-vocab-usage'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'
import type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'

async function loadDamageTypeBlockerIndexes(campaignId: string) {
  const [speciesIndex, spellIndex] = await Promise.all([
    loadCatalogBlockerIndex(campaignId, {
      readConfig: speciesWriteConfig.readConfig,
      contentTypeKey: 'species',
      extractIds: (record: Species) => extractSpeciesDamageTypeIdsFromRecord(record),
    }),
    loadCatalogBlockerIndex(campaignId, {
      readConfig: spellWriteConfig.readConfig,
      contentTypeKey: 'spells',
      extractIds: (record: Spell) => extractSpellDamageTypeIds(record as Record<string, unknown>),
    }),
  ])

  return [speciesIndex, spellIndex] as const
}

export async function resolveDamageTypeUsageBatch(
  ctx: VocabularyUsageResolverContext,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  const indexes = await loadDamageTypeBlockerIndexes(ctx.campaignId)
  return resolveComposedVocabUsageBatch(ctx, indexes, entryIds)
}

export async function resolveDamageTypeUsage(
  ctx: VocabularyUsageResolverContext,
  entryId: string,
): Promise<{ count: number; blockers: import('@rpg/contracts').ContentUsageBlocker[] }> {
  const indexes = await loadDamageTypeBlockerIndexes(ctx.campaignId)
  return resolveComposedVocabUsage(ctx, indexes, entryId)
}
