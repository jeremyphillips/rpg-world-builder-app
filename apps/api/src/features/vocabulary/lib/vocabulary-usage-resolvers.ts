import {
  CREATURE_TYPE_SET_ID,
  getVocabularySetCapability,
  vocabularySetIdsRequiringBatchCountResolver,
  vocabularySetIdsRequiringUsageResolver,
  type ContentUsageBlocker,
  type VocabularyOptionSetId,
  type VocabularyUsageSummaryLabels,
} from '@rpg/contracts'

import {
  resolveCreatureTypeSpeciesUsage,
  resolveCreatureTypeSpeciesUsageBatch,
  type VocabularyBatchUsageEntryResult,
} from './resolve-creature-type-species-usage'

export type VocabularyUsageResolverResult = {
  count: number
  blockers: ContentUsageBlocker[]
}

export type VocabularyUsageResolver = (
  campaignId: string,
  entryId: string,
) => Promise<VocabularyUsageResolverResult>

export type VocabularySetBatchUsageResolver = (
  campaignId: string,
  entryIds: readonly string[],
) => Promise<Map<string, VocabularyBatchUsageEntryResult>>

const defaultUsageResolver: VocabularyUsageResolver = async () => ({
  count: 0,
  blockers: [],
})

/** Display-ready tooltip nouns for overview Used by summaries — API-owned. */
export const VOCABULARY_USAGE_SUMMARY_LABELS: Partial<
  Record<VocabularyOptionSetId, VocabularyUsageSummaryLabels>
> = {
  [CREATURE_TYPE_SET_ID]: { singular: 'species', plural: 'species' },
}

export function getVocabularyUsageSummaryLabels(
  setId: VocabularyOptionSetId,
): VocabularyUsageSummaryLabels | undefined {
  return VOCABULARY_USAGE_SUMMARY_LABELS[setId]
}

/** Partial registry — only sets with custom usage/blocker logic register an entry. */
export const VOCABULARY_USAGE_RESOLVERS: Partial<
  Record<VocabularyOptionSetId, VocabularyUsageResolver>
> = {
  [CREATURE_TYPE_SET_ID]: resolveCreatureTypeSpeciesUsage,
}

/** Partial registry — batch resolvers for overview attachUsageCounts. */
export const VOCABULARY_BATCH_USAGE_RESOLVERS: Partial<
  Record<VocabularyOptionSetId, VocabularySetBatchUsageResolver>
> = {
  [CREATURE_TYPE_SET_ID]: resolveCreatureTypeSpeciesUsageBatch,
}

/** @deprecated Use {@link VOCABULARY_BATCH_USAGE_RESOLVERS}. */
export const VOCABULARY_BATCH_COUNT_RESOLVERS = VOCABULARY_BATCH_USAGE_RESOLVERS

export function getVocabularyUsageResolver(setId: VocabularyOptionSetId): VocabularyUsageResolver {
  return VOCABULARY_USAGE_RESOLVERS[setId] ?? defaultUsageResolver
}

export function getVocabularyBatchUsageResolver(
  setId: VocabularyOptionSetId,
): VocabularySetBatchUsageResolver | undefined {
  return VOCABULARY_BATCH_USAGE_RESOLVERS[setId]
}

/** @deprecated Use {@link getVocabularyBatchUsageResolver}. */
export function getVocabularyBatchCountResolver(
  setId: VocabularyOptionSetId,
): VocabularySetBatchUsageResolver | undefined {
  return getVocabularyBatchUsageResolver(setId)
}

/** Asserts every guard/counting-enabled set has a registered resolver. */
export function assertVocabularyUsageResolverCoverage(): void {
  for (const setId of vocabularySetIdsRequiringUsageResolver()) {
    if (!VOCABULARY_USAGE_RESOLVERS[setId]) {
      throw new Error(`Missing vocabulary usage resolver for "${setId}".`)
    }
  }
}

/** Asserts every batchUsageCounting set has a registered batch usage resolver. */
export function assertVocabularyBatchCountResolverCoverage(): void {
  for (const setId of vocabularySetIdsRequiringBatchCountResolver()) {
    if (!VOCABULARY_BATCH_USAGE_RESOLVERS[setId]) {
      throw new Error(`Missing vocabulary batch usage resolver for "${setId}".`)
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

export async function resolveVocabularyOptionUsageBatch(
  campaignId: string,
  setId: VocabularyOptionSetId,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  const resolver = getVocabularyBatchUsageResolver(setId)
  if (!resolver) {
    throw new Error(`Missing vocabulary batch usage resolver for "${setId}".`)
  }

  return resolver(campaignId, entryIds)
}

/** @deprecated Use {@link resolveVocabularyOptionUsageBatch}. */
export async function resolveVocabularyOptionUsageCountsBatch(
  campaignId: string,
  setId: VocabularyOptionSetId,
  entryIds: readonly string[],
): Promise<Map<string, number>> {
  const results = await resolveVocabularyOptionUsageBatch(campaignId, setId, entryIds)
  return new Map([...results.entries()].map(([entryId, result]) => [entryId, result.count]))
}
