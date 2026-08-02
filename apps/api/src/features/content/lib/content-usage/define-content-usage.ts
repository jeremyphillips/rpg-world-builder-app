import type {
  ContentOverviewUsageScope,
  ContentUsageBlocker,
  ContentUsageSummaryLabels,
} from '@rpg/contracts'

import {
  buildContentBatchUsageResults,
  type ContentBatchUsageEntryResult,
} from './build-content-batch-entry-result'
import {
  blockersForContentEntry,
  mergeBlockerIndexes,
} from './reference-sources/index-by-content-id'
import type { ContentUsageSource } from './content-usage-source'
import type { ContentUsageResolverContext } from './content-usage-context'

/** Surface key for content usage registration — ApiContentTypeKey plus nested subclasses. */
export type ContentUsageSurfaceKey =
  | 'classes'
  | 'spells'
  | 'species'
  | 'feats'
  | 'equipment'
  | 'skill-proficiencies'
  | 'organizations'
  | 'subclasses'

export type ContentUsageResolverResult = {
  count: number
  blockers: ContentUsageBlocker[]
}

export type ContentUsageResolver = (
  ctx: ContentUsageResolverContext,
  entryKey: string,
) => Promise<ContentUsageResolverResult>

export type ContentBatchUsageResolver = (
  ctx: ContentUsageResolverContext,
  entryKeys: readonly string[],
) => Promise<Map<string, ContentBatchUsageEntryResult>>

export type ContentUsageSourceRegistration = {
  source: ContentUsageSource
  entry: boolean
  batch: boolean
}

export const CONTENT_OVERVIEW_USAGE_SCOPE_VALUES = [
  'complete',
  'characters',
] as const satisfies readonly ContentOverviewUsageScope[]

export type DefineContentUsageInput = {
  contentType: ContentUsageSurfaceKey
  sources: readonly ContentUsageSourceRegistration[]
  summaryLabels: ContentUsageSummaryLabels
  /**
   * Which entity field keys the inverted index — skill-proficiencies use slug;
   * all other v1 surfaces use id.
   */
  lookupKey?: 'id' | 'slug'
  overviewUsageScope?: ContentOverviewUsageScope
}

export type ContentUsageRegistration = DefineContentUsageInput & {
  lookupKey: 'id' | 'slug'
  overviewUsageScope: ContentOverviewUsageScope
  entryResolver: ContentUsageResolver
  batchResolver: ContentBatchUsageResolver
}

function resolveOverviewUsageScope(
  sources: readonly ContentUsageSourceRegistration[],
  declaredScope: ContentOverviewUsageScope | undefined,
): ContentOverviewUsageScope {
  const hasEntryOnlySource = sources.some(
    (registration) => registration.entry && !registration.batch,
  )

  if (hasEntryOnlySource) {
    if (declaredScope == null || declaredScope === 'complete') {
      throw new Error(
        'Content usage registration with entry-only sources requires an explicit non-complete overviewUsageScope (e.g. "characters").',
      )
    }
    return declaredScope
  }

  // Fully batched: default to characters (v1 discovery is character-scoped).
  // Explicit "complete" is reserved for when batch covers all registered source kinds.
  if (declaredScope != null) {
    return declaredScope
  }

  return 'characters'
}

function buildEntryResolver(
  sources: readonly ContentUsageSourceRegistration[],
): ContentUsageResolver {
  const activeSources = sources.filter((registration) => registration.entry)

  return async (ctx, entryKey) => {
    const indexes = await Promise.all(
      activeSources.map((registration) => registration.source.loadBlockerIndex(ctx)),
    )
    const merged = mergeBlockerIndexes(indexes)
    const blockers = blockersForContentEntry(merged, entryKey)
    return { count: blockers.length, blockers }
  }
}

function buildBatchResolver(
  sources: readonly ContentUsageSourceRegistration[],
): ContentBatchUsageResolver {
  const activeSources = sources.filter((registration) => registration.batch)

  return async (ctx, entryKeys) => {
    const indexes = await Promise.all(
      activeSources.map((registration) => registration.source.loadBlockerIndex(ctx)),
    )
    const merged = mergeBlockerIndexes(indexes)
    return buildContentBatchUsageResults(
      entryKeys,
      new Map(entryKeys.map((entryKey) => [entryKey, blockersForContentEntry(merged, entryKey)])),
    )
  }
}

/** Registers discovery topology for one content surface and derives entry/batch resolvers. */
export function defineContentUsage(input: DefineContentUsageInput): ContentUsageRegistration {
  const entrySources = input.sources.filter((registration) => registration.entry)
  const batchSources = input.sources.filter((registration) => registration.batch)

  if (entrySources.length === 0) {
    throw new Error(
      `Content usage registration for "${input.contentType}" requires at least one entry source.`,
    )
  }

  if (batchSources.length === 0) {
    throw new Error(
      `Content usage registration for "${input.contentType}" requires at least one batch source.`,
    )
  }

  const overviewUsageScope = resolveOverviewUsageScope(input.sources, input.overviewUsageScope)

  return {
    ...input,
    lookupKey: input.lookupKey ?? 'id',
    overviewUsageScope,
    entryResolver: buildEntryResolver(input.sources),
    batchResolver: buildBatchResolver(input.sources),
  }
}
