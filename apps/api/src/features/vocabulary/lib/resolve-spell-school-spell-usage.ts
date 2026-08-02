import { SPELL_SCHOOL_SET_ID } from '@rpg/contracts'

import type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'
import { getVocabularyUsageRegistration } from './vocabulary-usage-registrations'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'

export async function resolveSpellSchoolSpellUsageBatch(
  ctx: VocabularyUsageResolverContext,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  return getVocabularyUsageRegistration(SPELL_SCHOOL_SET_ID).batchResolver(ctx, entryIds)
}

export async function resolveSpellSchoolSpellUsage(
  ctx: VocabularyUsageResolverContext,
  entryId: string,
): Promise<{ count: number; blockers: import('@rpg/contracts').ContentUsageBlocker[] }> {
  return getVocabularyUsageRegistration(SPELL_SCHOOL_SET_ID).entryResolver(ctx, entryId)
}
