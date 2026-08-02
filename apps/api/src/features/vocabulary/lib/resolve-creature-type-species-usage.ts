import { CREATURE_TYPE_SET_ID } from '@rpg/contracts'

import type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'
import { getVocabularyUsageRegistration } from './vocabulary-usage-registrations'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'

/** Batch resolver for overview loads — one species catalog read per set. */
export async function resolveCreatureTypeSpeciesUsageBatch(
  ctx: VocabularyUsageResolverContext,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  return getVocabularyUsageRegistration(CREATURE_TYPE_SET_ID).batchResolver(ctx, entryIds)
}

/** Species referencing a creature type id — used for usage counts and disable/delete blockers. */
export async function resolveCreatureTypeSpeciesUsage(
  ctx: VocabularyUsageResolverContext,
  entryId: string,
): Promise<{ count: number; blockers: import('@rpg/contracts').ContentUsageBlocker[] }> {
  return getVocabularyUsageRegistration(CREATURE_TYPE_SET_ID).entryResolver(ctx, entryId)
}
