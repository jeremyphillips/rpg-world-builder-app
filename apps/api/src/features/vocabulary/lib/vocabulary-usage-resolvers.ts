import {
  CREATURE_TYPE_SET_ID,
  getVocabularySetCapability,
  vocabularySetIdsRequiringBatchCountResolver,
  vocabularySetIdsRequiringUsageResolver,
  type ContentUsageBlocker,
  type VocabularyOptionSetId,
} from '@rpg/contracts'

import {
  resolveCreatureTypeSpeciesUsage,
  resolveCreatureTypeSpeciesUsageCountsBatch,
} from './resolve-creature-type-species-usage'

export type VocabularyUsageResolverResult = {
  count: number
  blockers: ContentUsageBlocker[]
}

export type VocabularyUsageResolver = (
  campaignId: string,
  entryId: string,
) => Promise<VocabularyUsageResolverResult>

export type VocabularySetBatchCountResolver = (
  campaignId: string,
  entryIds: readonly string[],
) => Promise<Map<string, number>>

const defaultUsageResolver: VocabularyUsageResolver = async () => ({
  count: 0,
  blockers: [],
})

/** Partial registry — only sets with custom usage/blocker logic register an entry. */
export const VOCABULARY_USAGE_RESOLVERS: Partial<
  Record<VocabularyOptionSetId, VocabularyUsageResolver>
> = {
  [CREATURE_TYPE_SET_ID]: resolveCreatureTypeSpeciesUsage,
}

/** Partial registry — count-only batch resolvers for overview attachUsageCounts. */
export const VOCABULARY_BATCH_COUNT_RESOLVERS: Partial<
  Record<VocabularyOptionSetId, VocabularySetBatchCountResolver>
> = {
  [CREATURE_TYPE_SET_ID]: resolveCreatureTypeSpeciesUsageCountsBatch,
}

export function getVocabularyUsageResolver(setId: VocabularyOptionSetId): VocabularyUsageResolver {
  return VOCABULARY_USAGE_RESOLVERS[setId] ?? defaultUsageResolver
}

export function getVocabularyBatchCountResolver(
  setId: VocabularyOptionSetId,
): VocabularySetBatchCountResolver | undefined {
  return VOCABULARY_BATCH_COUNT_RESOLVERS[setId]
}

/** Asserts every guard/counting-enabled set has a registered resolver. */
export function assertVocabularyUsageResolverCoverage(): void {
  for (const setId of vocabularySetIdsRequiringUsageResolver()) {
    if (!VOCABULARY_USAGE_RESOLVERS[setId]) {
      throw new Error(`Missing vocabulary usage resolver for "${setId}".`)
    }
  }
}

/** Asserts every batchUsageCounting set has a registered batch count resolver. */
export function assertVocabularyBatchCountResolverCoverage(): void {
  for (const setId of vocabularySetIdsRequiringBatchCountResolver()) {
    if (!VOCABULARY_BATCH_COUNT_RESOLVERS[setId]) {
      throw new Error(`Missing vocabulary batch count resolver for "${setId}".`)
    }
  }
}

export async function resolveVocabularyOptionUsage(
  campaignId: string,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<VocabularyUsageResolverResult> {
  const capability = getVocabularySetCapability(setId)
  if (!capability.usageCounting && !capability.disableGuard && !capability.deleteGuard) {
    return defaultUsageResolver(campaignId, entryId)
  }

  return getVocabularyUsageResolver(setId)(campaignId, entryId)
}

export async function resolveVocabularyOptionUsageCountsBatch(
  campaignId: string,
  setId: VocabularyOptionSetId,
  entryIds: readonly string[],
): Promise<Map<string, number>> {
  const resolver = getVocabularyBatchCountResolver(setId)
  if (!resolver) {
    throw new Error(`Missing vocabulary batch count resolver for "${setId}".`)
  }

  return resolver(campaignId, entryIds)
}
