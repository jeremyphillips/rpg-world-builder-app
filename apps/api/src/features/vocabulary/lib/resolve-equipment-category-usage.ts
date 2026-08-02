import type { Equipment } from '@rpg/contracts'

import { equipmentWriteConfig } from '../../content/equipment/equipment.config'

import { extractEquipmentCategoryId } from './reference-sources/equipment'
import {
  resolveCatalogVocabUsage,
  resolveCatalogVocabUsageBatch,
} from './resolve-catalog-vocab-usage'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'
import type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'

function equipmentCategoryUsageConfig() {
  return {
    readConfig: equipmentWriteConfig.readConfig,
    contentTypeKey: 'equipment' as const,
    extractIds: (record: Equipment) => extractEquipmentCategoryId(record),
  }
}

export async function resolveEquipmentCategoryUsageBatch(
  ctx: VocabularyUsageResolverContext,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  return resolveCatalogVocabUsageBatch(ctx, equipmentCategoryUsageConfig(), entryIds)
}

export async function resolveEquipmentCategoryUsage(
  ctx: VocabularyUsageResolverContext,
  entryId: string,
): Promise<{ count: number; blockers: import('@rpg/contracts').ContentUsageBlocker[] }> {
  return resolveCatalogVocabUsage(ctx, equipmentCategoryUsageConfig(), entryId)
}
