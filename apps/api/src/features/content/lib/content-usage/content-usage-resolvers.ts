import type {
  ContentEntryUsage,
  ContentListUsageFields,
  ContentOverviewUsageScope,
  ContentUsageSummaryLabels,
} from '@rpg/contracts'
import { contentEntryUsageSchema, contentListUsageFieldsSchema } from '@rpg/contracts'

import type { ContentBatchUsageEntryResult } from './build-content-batch-entry-result'
import type {
  ContentUsageResolver,
  ContentUsageResolverResult,
  ContentBatchUsageResolver,
  ContentUsageSurfaceKey,
} from './define-content-usage'
import { CONTENT_USAGE_SURFACE_KEYS } from './define-content-usage'
import {
  CONTENT_USAGE_REGISTRATIONS,
  getContentUsageRegistration,
} from './content-usage-registrations'
import type { ContentUsageResolverContext } from './content-usage-context'
import { buildContentEntryUsageFromBlockers } from './map-content-usage-references'
import type { ContentWriteConfig, WriteEntityBase } from '../content-write-config'

export type { ContentUsageResolverContext, ContentUsagePurpose } from './content-usage-context'
export type { ContentBatchUsageEntryResult } from './build-content-batch-entry-result'
export type {
  ContentUsageResolver,
  ContentUsageResolverResult,
  ContentBatchUsageResolver,
  ContentUsageSurfaceKey,
  ContentUsageRegistration,
} from './define-content-usage'

/** Resolve the usage surface key for a write config (subclasses via campaignAccessTargetType). */
export function contentUsageSurfaceKeyForWriteConfig(
  config: Pick<ContentWriteConfig<WriteEntityBase>, 'typeName' | 'campaignAccessTargetType'>,
): ContentUsageSurfaceKey {
  const key = config.campaignAccessTargetType ?? config.typeName
  return key as ContentUsageSurfaceKey
}

export function getContentUsageSummaryLabels(
  contentType: ContentUsageSurfaceKey,
): ContentUsageSummaryLabels | undefined {
  return CONTENT_USAGE_REGISTRATIONS[contentType]?.summaryLabels
}

export function getContentOverviewUsageScope(
  contentType: ContentUsageSurfaceKey,
): ContentOverviewUsageScope | undefined {
  return CONTENT_USAGE_REGISTRATIONS[contentType]?.overviewUsageScope
}

export function getContentUsageResolver(contentType: ContentUsageSurfaceKey): ContentUsageResolver {
  return getContentUsageRegistration(contentType).entryResolver
}

export function getContentBatchUsageResolver(
  contentType: ContentUsageSurfaceKey,
): ContentBatchUsageResolver | undefined {
  const registration = CONTENT_USAGE_REGISTRATIONS[contentType]
  if (!registration || !registration.sources.some((source) => source.batch)) {
    return undefined
  }
  return registration.batchResolver
}

export function resolveContentUsageLookupKey(
  contentType: ContentUsageSurfaceKey,
  entity: { id: string; slug: string },
): string {
  const registration = getContentUsageRegistration(contentType)
  return registration.lookupKey === 'slug' ? entity.slug : entity.id
}

/** Expected usage registrations — derived from contracts/API type SSOT. */
export const EXPECTED_CONTENT_USAGE_SURFACES = CONTENT_USAGE_SURFACE_KEYS

export { NESTED_CONTENT_USAGE_SURFACE_KEYS } from './define-content-usage'

/** Surfaces registered for detail usage only until overview Used By batch exists. */
const CONTENT_USAGE_BATCH_OPTIONAL_SURFACES = new Set<ContentUsageSurfaceKey>(['monsters'])

/** Asserts every catalog + nested surface has entry and batch usage registrations. */
export function assertContentUsageRegistrationCoverage(): void {
  const registrationKeys = Object.keys(CONTENT_USAGE_REGISTRATIONS).sort()
  const expectedKeys = [...CONTENT_USAGE_SURFACE_KEYS].sort()

  if (registrationKeys.join('|') !== expectedKeys.join('|')) {
    throw new Error(
      `Content usage registration keys drift from CONTENT_USAGE_SURFACE_KEYS: registered=[${registrationKeys.join(', ')}], expected=[${expectedKeys.join(', ')}].`,
    )
  }

  for (const contentType of CONTENT_USAGE_SURFACE_KEYS) {
    const registration = CONTENT_USAGE_REGISTRATIONS[contentType]
    if (!registration || !registration.sources.some((source) => source.entry)) {
      throw new Error(`Missing content usage registration with entry sources for "${contentType}".`)
    }
    if (
      !registration.sources.some((source) => source.batch) &&
      !CONTENT_USAGE_BATCH_OPTIONAL_SURFACES.has(contentType)
    ) {
      throw new Error(`Missing content usage registration with batch sources for "${contentType}".`)
    }
    if (!registration.viewerCharacterRelationship) {
      throw new Error(`Missing viewerCharacterRelationship declaration for "${contentType}".`)
    }
  }
}

export async function resolveContentUsage(
  ctx: ContentUsageResolverContext,
  contentType: ContentUsageSurfaceKey,
  entryKey: string,
): Promise<ContentUsageResolverResult> {
  return getContentUsageResolver(contentType)(ctx, entryKey)
}

export async function resolveContentUsageBatch(
  ctx: ContentUsageResolverContext,
  contentType: ContentUsageSurfaceKey,
  entryKeys: readonly string[],
): Promise<Map<string, ContentBatchUsageEntryResult>> {
  const resolver = getContentBatchUsageResolver(contentType)
  if (!resolver) {
    throw new Error(`Missing content batch usage resolver for "${contentType}".`)
  }

  return resolver(ctx, entryKeys)
}

/** Authoritative character usage blockers for delete/demote/access guards. */
export async function resolveAuthoritativeContentUsageBlockers(
  campaignId: string,
  contentType: ContentUsageSurfaceKey,
  entity: { id: string; slug: string },
): Promise<ContentUsageResolverResult['blockers']> {
  const { blockers } = await resolveContentUsage(
    { campaignId, purpose: 'authoritative_guard' },
    contentType,
    resolveContentUsageLookupKey(contentType, entity),
  )
  return blockers
}

export async function resolveContentEntryUsage(
  ctx: ContentUsageResolverContext,
  contentType: ContentUsageSurfaceKey,
  entity: { id: string; slug: string },
): Promise<ContentEntryUsage> {
  const { blockers } = await resolveContentUsage(
    ctx,
    contentType,
    resolveContentUsageLookupKey(contentType, entity),
  )
  return contentEntryUsageSchema.parse(buildContentEntryUsageFromBlockers(blockers))
}

export type ContentListItemWithUsage<T extends { id: string; slug: string }> = T &
  ContentListUsageFields

/** Attach batch usedBy / usedBySummary when the surface registers batch sources. */
export async function attachContentUsageCounts<T extends { id: string; slug: string }>(
  ctx: ContentUsageResolverContext,
  contentType: ContentUsageSurfaceKey,
  items: readonly T[],
): Promise<ContentListItemWithUsage<T>[]> {
  const registration = CONTENT_USAGE_REGISTRATIONS[contentType]
  if (!registration || !registration.sources.some((source) => source.batch)) {
    return items.map((item) => ({ ...item, usedBy: 0 }))
  }

  const lookupKeys = items.map((item) => resolveContentUsageLookupKey(contentType, item))
  const batchResults = await resolveContentUsageBatch(ctx, contentType, lookupKeys)

  return items.map((item, index) => {
    const result = batchResults.get(lookupKeys[index]!) ?? { count: 0, summaryReferences: [] }
    const usageFields = contentListUsageFieldsSchema.parse({
      usedBy: result.count,
      ...(result.summaryReferences.length > 0 ? { usedBySummary: result.summaryReferences } : {}),
    })
    return { ...item, ...usageFields }
  })
}

export {
  getContentUsageRegistration,
  hasContentUsageRegistration,
  CONTENT_USAGE_REGISTRATIONS,
} from './content-usage-registrations'
