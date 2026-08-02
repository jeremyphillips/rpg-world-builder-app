import type { Spell } from '@rpg/contracts'

import { spellWriteConfig } from '../../content/spells/spells.config'

import { extractSpellSchoolId } from './reference-sources/spells'
import {
  resolveCatalogVocabUsage,
  resolveCatalogVocabUsageBatch,
} from './resolve-catalog-vocab-usage'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'
import type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'

function spellSchoolUsageConfig() {
  return {
    readConfig: spellWriteConfig.readConfig,
    contentTypeKey: 'spells' as const,
    extractIds: (record: Spell) => extractSpellSchoolId(record),
  }
}

export async function resolveSpellSchoolSpellUsageBatch(
  ctx: VocabularyUsageResolverContext,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  return resolveCatalogVocabUsageBatch(ctx, spellSchoolUsageConfig(), entryIds)
}

export async function resolveSpellSchoolSpellUsage(
  ctx: VocabularyUsageResolverContext,
  entryId: string,
): Promise<{ count: number; blockers: import('@rpg/contracts').ContentUsageBlocker[] }> {
  return resolveCatalogVocabUsage(ctx, spellSchoolUsageConfig(), entryId)
}
