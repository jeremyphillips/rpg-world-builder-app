import {
  API_CONTENT_TYPE_KEYS,
  type CharacterRelationshipKind,
  type ContentOverviewUsageScope,
  type ContentUsageBlocker,
  type ContentUsageSummaryLabels,
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
import { filterContentUsageBlockersForViewer } from './filter-content-usage-blockers-for-viewer'

/** Nested surfaces registered separately from {@link API_CONTENT_TYPE_KEYS}. */
export const NESTED_CONTENT_USAGE_SURFACE_KEYS = ['subclasses'] as const

/** Surface keys that require a content usage registration entry. */
export const CONTENT_USAGE_SURFACE_KEYS = [
  ...API_CONTENT_TYPE_KEYS,
  ...NESTED_CONTENT_USAGE_SURFACE_KEYS,
] as const

/** ApiContentTypeKey plus nested subclasses. */
export type ContentUsageSurfaceKey = (typeof CONTENT_USAGE_SURFACE_KEYS)[number]

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

export type ViewerCharacterRelationshipStrategy =
  | { strategy: 'none' }
  | { strategy: 'fixed'; kind: CharacterRelationshipKind; hasNoun?: string }
  | { strategy: 'spell-selection' }

export type DefineContentUsageInput = {
  contentType: ContentUsageSurfaceKey
  sources: readonly ContentUsageSourceRegistration[]
  summaryLabels: ContentUsageSummaryLabels
  viewerCharacterRelationship: ViewerCharacterRelationshipStrategy
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

function validateViewerCharacterRelationship(
  contentType: ContentUsageSurfaceKey,
  strategy: ViewerCharacterRelationshipStrategy,
): void {
  if (strategy.strategy === 'fixed' && strategy.kind === 'has') {
    if (!strategy.hasNoun || strategy.hasNoun.trim().length === 0) {
      throw new Error(
        `Content usage registration for "${contentType}" requires hasNoun when viewerCharacterRelationship kind is "has".`,
      )
    }
  }
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
    const rawBlockers = blockersForContentEntry(merged, entryKey)
    const blockers = await filterContentUsageBlockersForViewer(ctx, rawBlockers)
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
    const blockersByKey = new Map<string, ContentUsageBlocker[]>()
    for (const entryKey of entryKeys) {
      const rawBlockers = blockersForContentEntry(merged, entryKey)
      blockersByKey.set(entryKey, await filterContentUsageBlockersForViewer(ctx, rawBlockers))
    }
    return buildContentBatchUsageResults(entryKeys, blockersByKey)
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

  validateViewerCharacterRelationship(input.contentType, input.viewerCharacterRelationship)

  const overviewUsageScope = resolveOverviewUsageScope(input.sources, input.overviewUsageScope)

  return {
    ...input,
    lookupKey: input.lookupKey ?? 'id',
    overviewUsageScope,
    entryResolver: buildEntryResolver(input.sources),
    batchResolver: buildBatchResolver(input.sources),
  }
}
