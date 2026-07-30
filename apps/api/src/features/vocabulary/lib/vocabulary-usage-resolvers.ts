import {
  CREATURE_TYPE_SET_ID,
  getVocabularySetCapability,
  vocabularySetIdsRequiringUsageResolver,
  type ContentUsageBlocker,
  type VocabularyOptionSetId,
} from '@rpg/contracts'

import { resolveCreatureTypeSpeciesUsage } from './resolve-creature-type-species-usage'

export type VocabularyUsageResolverResult = {
  count: number
  blockers: ContentUsageBlocker[]
}

export type VocabularyUsageResolver = (
  campaignId: string,
  entryId: string,
) => Promise<VocabularyUsageResolverResult>

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

export function getVocabularyUsageResolver(setId: VocabularyOptionSetId): VocabularyUsageResolver {
  return VOCABULARY_USAGE_RESOLVERS[setId] ?? defaultUsageResolver
}

/** Asserts every guard/counting-enabled set has a registered resolver. */
export function assertVocabularyUsageResolverCoverage(): void {
  for (const setId of vocabularySetIdsRequiringUsageResolver()) {
    if (!VOCABULARY_USAGE_RESOLVERS[setId]) {
      throw new Error(`Missing vocabulary usage resolver for "${setId}".`)
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
