import type { Spell } from '@rpg/contracts'

import { spellWriteConfig } from '../../content/spells/spells.config'

import { extractSpellConditionIds } from './reference-sources/spells'
import {
  resolveCatalogVocabUsage,
  resolveCatalogVocabUsageBatch,
} from './resolve-catalog-vocab-usage'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'
import type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'

function spellConditionUsageConfig() {
  return {
    readConfig: spellWriteConfig.readConfig,
    contentTypeKey: 'spells' as const,
    extractIds: (record: Spell) => extractSpellConditionIds(record),
  }
}

export async function resolveConditionSpellUsageBatch(
  ctx: VocabularyUsageResolverContext,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  return resolveCatalogVocabUsageBatch(ctx, spellConditionUsageConfig(), entryIds)
}

export async function resolveConditionSpellUsage(
  ctx: VocabularyUsageResolverContext,
  entryId: string,
): Promise<{ count: number; blockers: import('@rpg/contracts').ContentUsageBlocker[] }> {
  return resolveCatalogVocabUsage(ctx, spellConditionUsageConfig(), entryId)
}
