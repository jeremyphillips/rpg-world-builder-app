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

export const VOCABULARY_OVERVIEW_USAGE_SCOPES = ['complete', 'content_only'] as const

export type VocabularyOverviewUsageScope = (typeof VOCABULARY_OVERVIEW_USAGE_SCOPES)[number]

export type DefineVocabularyUsageInput = {
  setId: VocabularyOptionSetId
  sources: readonly VocabularyUsageSourceRegistration[]
  summaryLabels: VocabularyUsageSummaryLabels
  overviewUsageScope?: VocabularyOverviewUsageScope
}

export type VocabularyUsageRegistration = DefineVocabularyUsageInput & {
  overviewUsageScope: VocabularyOverviewUsageScope
  entryResolver: VocabularyUsageResolver
  batchResolver: VocabularySetBatchUsageResolver
}

function resolveOverviewUsageScope(
  sources: readonly VocabularyUsageSourceRegistration[],
  declaredScope: VocabularyOverviewUsageScope | undefined,
): VocabularyOverviewUsageScope {
  const hasEntryOnlySource = sources.some(
    (registration) => registration.entry && !registration.batch,
  )

  if (hasEntryOnlySource) {
    if (declaredScope == null || declaredScope === 'complete') {
      throw new Error(
        'Vocabulary usage registration with entry-only sources requires an explicit non-complete overviewUsageScope (e.g. "content_only").',
      )
    }
    return declaredScope
  }

  if (declaredScope != null && declaredScope !== 'complete') {
    throw new Error(
      'Vocabulary usage registration with fully batched sources must use overviewUsageScope "complete".',
    )
  }

  return 'complete'
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

  const overviewUsageScope = resolveOverviewUsageScope(input.sources, input.overviewUsageScope)

  return {
    ...input,
    overviewUsageScope,
    entryResolver: buildEntryResolver(input.sources),
    batchResolver: buildBatchResolver(input.sources),
  }
}
