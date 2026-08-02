import type { Equipment } from '@rpg/contracts'

import { equipmentWriteConfig } from '../../content/equipment/equipment.config'

import { extractWeaponPropertyIds } from './reference-sources/equipment'
import {
  resolveCatalogVocabUsage,
  resolveCatalogVocabUsageBatch,
} from './resolve-catalog-vocab-usage'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'
import type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'

function weaponPropertyUsageConfig() {
  return {
    readConfig: equipmentWriteConfig.readConfig,
    contentTypeKey: 'equipment' as const,
    extractIds: (record: Equipment) => extractWeaponPropertyIds(record),
  }
}

export async function resolveWeaponPropertyEquipmentUsageBatch(
  ctx: VocabularyUsageResolverContext,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  return resolveCatalogVocabUsageBatch(ctx, weaponPropertyUsageConfig(), entryIds)
}

export async function resolveWeaponPropertyEquipmentUsage(
  ctx: VocabularyUsageResolverContext,
  entryId: string,
): Promise<{ count: number; blockers: import('@rpg/contracts').ContentUsageBlocker[] }> {
  return resolveCatalogVocabUsage(ctx, weaponPropertyUsageConfig(), entryId)
}
