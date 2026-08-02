import type {
  ContentUsageBlocker,
  VocabularyOptionSetId,
  VocabularyUsageSummaryLabels,
} from '@rpg/contracts'

import {
  buildVocabularyBatchUsageResults,
  type VocabularyBatchUsageEntryResult,
} from './build-vocabulary-batch-entry-result'
import { blockersForVocabEntry, mergeBlockerIndexes } from './reference-sources/index-by-vocab-id'
import type { VocabularyUsageSource } from './vocabulary-usage-source'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'

export type VocabularyUsageResolverResult = {
  count: number
  blockers: ContentUsageBlocker[]
}

export type VocabularyUsageResolver = (
  ctx: VocabularyUsageResolverContext,
  entryId: string,
) => Promise<VocabularyUsageResolverResult>

export type VocabularySetBatchUsageResolver = (
  ctx: VocabularyUsageResolverContext,
  entryIds: readonly string[],
) => Promise<Map<string, VocabularyBatchUsageEntryResult>>

export type VocabularyUsageSourceRegistration = {
  source: VocabularyUsageSource
  entry: boolean
  batch: boolean
}

export type DefineVocabularyUsageInput = {
  setId: VocabularyOptionSetId
  sources: readonly VocabularyUsageSourceRegistration[]
  summaryLabels: VocabularyUsageSummaryLabels
}

export type VocabularyUsageRegistration = DefineVocabularyUsageInput & {
  entryResolver: VocabularyUsageResolver
  batchResolver: VocabularySetBatchUsageResolver
}

function buildEntryResolver(
  sources: readonly VocabularyUsageSourceRegistration[],
): VocabularyUsageResolver {
  const activeSources = sources.filter((registration) => registration.entry)

  return async (ctx, entryId) => {
    const indexes = await Promise.all(
      activeSources.map((registration) => registration.source.loadBlockerIndex(ctx)),
    )
    const merged = mergeBlockerIndexes(indexes)
    const blockers = blockersForVocabEntry(merged, entryId)
    return { count: blockers.length, blockers }
  }
}

function buildBatchResolver(
  sources: readonly VocabularyUsageSourceRegistration[],
): VocabularySetBatchUsageResolver {
  const activeSources = sources.filter((registration) => registration.batch)

  return async (ctx, entryIds) => {
    const indexes = await Promise.all(
      activeSources.map((registration) => registration.source.loadBlockerIndex(ctx)),
    )
    const merged = mergeBlockerIndexes(indexes)
    return buildVocabularyBatchUsageResults(
      entryIds,
      new Map(entryIds.map((entryId) => [entryId, blockersForVocabEntry(merged, entryId)])),
    )
  }
}

/** Registers discovery topology for one vocabulary set and derives entry/batch resolvers. */
export function defineVocabularyUsage(
  input: DefineVocabularyUsageInput,
): VocabularyUsageRegistration {
  const entrySources = input.sources.filter((registration) => registration.entry)
  const batchSources = input.sources.filter((registration) => registration.batch)

  if (entrySources.length === 0) {
    throw new Error(
      `Vocabulary usage registration for "${input.setId}" requires at least one entry source.`,
    )
  }

  if (batchSources.length === 0) {
    throw new Error(
      `Vocabulary usage registration for "${input.setId}" requires at least one batch source.`,
    )
  }

  return {
    ...input,
    entryResolver: buildEntryResolver(input.sources),
    batchResolver: buildBatchResolver(input.sources),
  }
}
