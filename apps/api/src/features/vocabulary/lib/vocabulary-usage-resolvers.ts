import {
  getVocabularySetCapability,
  vocabularySetIdsRequiringBatchCountResolver,
  vocabularySetIdsRequiringUsageResolver,
  type VocabularyOptionSetId,
  type VocabularyUsageSummaryLabels,
} from '@rpg/contracts'

import type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'
import type {
  VocabularyUsageRegistration,
  VocabularyUsageResolver,
  VocabularyUsageResolverResult,
  VocabularySetBatchUsageResolver,
} from './define-vocabulary-usage'
import { VOCABULARY_USAGE_REGISTRATIONS } from './vocabulary-usage-registrations'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'

export type {
  VocabularyUsageResolverContext,
  VocabularyUsagePurpose,
} from './vocabulary-usage-context'
export type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'
export type {
  VocabularyUsageResolver,
  VocabularyUsageResolverResult,
  VocabularySetBatchUsageResolver,
} from './define-vocabulary-usage'

const defaultUsageResolver: VocabularyUsageResolver = async () => ({
  count: 0,
  blockers: [],
})

function listRegistrations(): VocabularyUsageRegistration[] {
  return Object.values(VOCABULARY_USAGE_REGISTRATIONS).filter(
    (registration): registration is VocabularyUsageRegistration => registration != null,
  )
}

/** Derived from {@link defineVocabularyUsage} registrations — display-ready tooltip nouns. */
export const VOCABULARY_USAGE_SUMMARY_LABELS: Partial<
  Record<VocabularyOptionSetId, VocabularyUsageSummaryLabels>
> = Object.fromEntries(
  listRegistrations().map((registration) => [registration.setId, registration.summaryLabels]),
)

export function getVocabularyUsageSummaryLabels(
  setId: VocabularyOptionSetId,
): VocabularyUsageSummaryLabels | undefined {
  return VOCABULARY_USAGE_SUMMARY_LABELS[setId]
}

/** Derived entry resolver registry from set-level usage registrations. */
export const VOCABULARY_USAGE_RESOLVERS: Partial<
  Record<VocabularyOptionSetId, VocabularyUsageResolver>
> = Object.fromEntries(
  listRegistrations().map((registration) => [registration.setId, registration.entryResolver]),
)

/** Derived batch resolver registry from set-level usage registrations. */
export const VOCABULARY_BATCH_USAGE_RESOLVERS: Partial<
  Record<VocabularyOptionSetId, VocabularySetBatchUsageResolver>
> = Object.fromEntries(
  listRegistrations().map((registration) => [registration.setId, registration.batchResolver]),
)

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

/** Asserts every guard/usage-resolution-enabled set has a usage registration with entry sources. */
export function assertVocabularyUsageResolverCoverage(): void {
  for (const setId of vocabularySetIdsRequiringUsageResolver()) {
    const registration = VOCABULARY_USAGE_REGISTRATIONS[setId]
    if (!registration || !registration.sources.some((source) => source.entry)) {
      throw new Error(`Missing vocabulary usage registration for "${setId}".`)
    }
  }
}

/** Asserts every batchUsageCounting set has a registration with batch sources. */
export function assertVocabularyBatchCountResolverCoverage(): void {
  for (const setId of vocabularySetIdsRequiringBatchCountResolver()) {
    const registration = VOCABULARY_USAGE_REGISTRATIONS[setId]
    if (!registration || !registration.sources.some((source) => source.batch)) {
      throw new Error(`Missing vocabulary batch usage registration for "${setId}".`)
    }
  }
}

export async function resolveVocabularyOptionUsage(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
  entryId: string,
): Promise<VocabularyUsageResolverResult> {
  const capability = getVocabularySetCapability(setId)
  if (!capability.usageResolution && !capability.disableGuard && !capability.deleteGuard) {
    return defaultUsageResolver(ctx, entryId)
  }

  return getVocabularyUsageResolver(setId)(ctx, entryId)
}

export async function resolveVocabularyOptionUsageBatch(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  const resolver = getVocabularyBatchUsageResolver(setId)
  if (!resolver) {
    throw new Error(`Missing vocabulary batch usage resolver for "${setId}".`)
  }

  return resolver(ctx, entryIds)
}

/** @deprecated Use {@link resolveVocabularyOptionUsageBatch}. */
export async function resolveVocabularyOptionUsageCountsBatch(
  ctx: VocabularyUsageResolverContext,
  setId: VocabularyOptionSetId,
  entryIds: readonly string[],
): Promise<Map<string, number>> {
  const results = await resolveVocabularyOptionUsageBatch(ctx, setId, entryIds)
  return new Map([...results.entries()].map(([entryId, result]) => [entryId, result.count]))
}

export {
  getVocabularyUsageRegistration,
  VOCABULARY_USAGE_REGISTRATIONS,
} from './vocabulary-usage-registrations'
