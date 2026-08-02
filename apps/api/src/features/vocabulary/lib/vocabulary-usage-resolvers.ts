import {
  CONDITION_SET_ID,
  CREATURE_SIZE_SET_ID,
  CREATURE_TYPE_SET_ID,
  DAMAGE_TYPE_SET_ID,
  EQUIPMENT_CATEGORY_SET_ID,
  getVocabularySetCapability,
  LANGUAGE_SET_ID,
  SENSE_SET_ID,
  SPELL_SCHOOL_SET_ID,
  vocabularySetIdsRequiringBatchCountResolver,
  vocabularySetIdsRequiringUsageResolver,
  WEAPON_PROPERTY_SET_ID,
  type ContentUsageBlocker,
  type VocabularyOptionSetId,
  type VocabularyUsageSummaryLabels,
} from '@rpg/contracts'

import type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'
import {
  resolveConditionSpellUsage,
  resolveConditionSpellUsageBatch,
} from './resolve-condition-spell-usage'
import {
  resolveCreatureTypeSpeciesUsage,
  resolveCreatureTypeSpeciesUsageBatch,
} from './resolve-creature-type-species-usage'
import { resolveDamageTypeUsage, resolveDamageTypeUsageBatch } from './resolve-damage-type-usage'
import {
  resolveEquipmentCategoryUsage,
  resolveEquipmentCategoryUsageBatch,
} from './resolve-equipment-category-usage'
import { resolveLanguageUsage, resolveLanguageUsageBatch } from './resolve-language-usage'
import {
  resolveSenseSpeciesUsage,
  resolveSenseSpeciesUsageBatch,
} from './resolve-sense-species-usage'
import { resolveSizeSpeciesUsage, resolveSizeSpeciesUsageBatch } from './resolve-size-species-usage'
import {
  resolveSpellSchoolSpellUsage,
  resolveSpellSchoolSpellUsageBatch,
} from './resolve-spell-school-spell-usage'
import {
  resolveWeaponPropertyEquipmentUsage,
  resolveWeaponPropertyEquipmentUsageBatch,
} from './resolve-weapon-property-equipment-usage'
import type { VocabularyUsageResolverContext } from './vocabulary-usage-context'

export type { VocabularyUsageResolverContext } from './vocabulary-usage-context'
export type { VocabularyBatchUsageEntryResult } from './build-vocabulary-batch-entry-result'

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

const defaultUsageResolver: VocabularyUsageResolver = async () => ({
  count: 0,
  blockers: [],
})

/** Display-ready tooltip nouns for overview Used by summaries — API-owned, presentational only. */
export const VOCABULARY_USAGE_SUMMARY_LABELS: Partial<
  Record<VocabularyOptionSetId, VocabularyUsageSummaryLabels>
> = {
  [CREATURE_TYPE_SET_ID]: { singular: 'species', plural: 'species' },
  [SPELL_SCHOOL_SET_ID]: { singular: 'spell', plural: 'spells' },
  [CREATURE_SIZE_SET_ID]: { singular: 'species', plural: 'species' },
  [WEAPON_PROPERTY_SET_ID]: { singular: 'weapon', plural: 'weapons' },
  [EQUIPMENT_CATEGORY_SET_ID]: { singular: 'item', plural: 'items' },
  [CONDITION_SET_ID]: { singular: 'spell', plural: 'spells' },
  [DAMAGE_TYPE_SET_ID]: { singular: 'reference', plural: 'references' },
  [LANGUAGE_SET_ID]: { singular: 'reference', plural: 'references' },
  [SENSE_SET_ID]: { singular: 'species', plural: 'species' },
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
  [SPELL_SCHOOL_SET_ID]: resolveSpellSchoolSpellUsage,
  [CREATURE_SIZE_SET_ID]: resolveSizeSpeciesUsage,
  [WEAPON_PROPERTY_SET_ID]: resolveWeaponPropertyEquipmentUsage,
  [EQUIPMENT_CATEGORY_SET_ID]: resolveEquipmentCategoryUsage,
  [CONDITION_SET_ID]: resolveConditionSpellUsage,
  [DAMAGE_TYPE_SET_ID]: resolveDamageTypeUsage,
  [LANGUAGE_SET_ID]: resolveLanguageUsage,
  [SENSE_SET_ID]: resolveSenseSpeciesUsage,
}

/** Partial registry — batch resolvers for overview attachUsageCounts. */
export const VOCABULARY_BATCH_USAGE_RESOLVERS: Partial<
  Record<VocabularyOptionSetId, VocabularySetBatchUsageResolver>
> = {
  [CREATURE_TYPE_SET_ID]: resolveCreatureTypeSpeciesUsageBatch,
  [SPELL_SCHOOL_SET_ID]: resolveSpellSchoolSpellUsageBatch,
  [CREATURE_SIZE_SET_ID]: resolveSizeSpeciesUsageBatch,
  [WEAPON_PROPERTY_SET_ID]: resolveWeaponPropertyEquipmentUsageBatch,
  [EQUIPMENT_CATEGORY_SET_ID]: resolveEquipmentCategoryUsageBatch,
  [CONDITION_SET_ID]: resolveConditionSpellUsageBatch,
  [DAMAGE_TYPE_SET_ID]: resolveDamageTypeUsageBatch,
  [LANGUAGE_SET_ID]: resolveLanguageUsageBatch,
  [SENSE_SET_ID]: resolveSenseSpeciesUsageBatch,
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

/** Asserts every guard/usage-resolution-enabled set has a registered resolver. */
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
