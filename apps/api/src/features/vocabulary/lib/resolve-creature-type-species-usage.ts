import type { ContentUsageBlocker } from '@rpg/contracts'

import { resolveCatalogForCampaign } from '../../content/content.service'
import { speciesWriteConfig } from '../../content/species/species.config'

import { buildVocabularyEntryUsageFromBlockers } from './map-vocabulary-usage-references'
import { VOCABULARY_USAGE_SUMMARY_MAX_ITEMS } from './vocabulary-usage-summary'

function speciesToContentBlocker(record: {
  id: string
  name: string
  slug: string
  creatureType: string
}): ContentUsageBlocker {
  return {
    kind: 'content',
    contentTypeKey: 'species',
    id: record.id,
    label: record.name,
    slug: record.slug,
  }
}

async function loadSpeciesBlockersByCreatureType(
  campaignId: string,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const species = await resolveCatalogForCampaign(speciesWriteConfig.readConfig, campaignId)
  const blockersByType = new Map<string, ContentUsageBlocker[]>()

  for (const record of species) {
    const blockers = blockersByType.get(record.creatureType) ?? []
    blockers.push(speciesToContentBlocker(record))
    blockersByType.set(record.creatureType, blockers)
  }

  return blockersByType
}

export type VocabularyBatchUsageEntryResult = {
  count: number
  summaryReferences: ReturnType<typeof buildVocabularyEntryUsageFromBlockers>['references']
}

function buildBatchUsageEntryResult(
  blockers: ContentUsageBlocker[],
): VocabularyBatchUsageEntryResult {
  const { references, usedBy } = buildVocabularyEntryUsageFromBlockers(blockers)

  return {
    count: usedBy,
    summaryReferences: references.slice(0, VOCABULARY_USAGE_SUMMARY_MAX_ITEMS),
  }
}

/** Batch resolver for overview loads — one species catalog read per set. */
export async function resolveCreatureTypeSpeciesUsageBatch(
  campaignId: string,
  entryIds: readonly string[],
): Promise<Map<string, VocabularyBatchUsageEntryResult>> {
  const blockersByType = await loadSpeciesBlockersByCreatureType(campaignId)

  return new Map(
    entryIds.map((entryId) => [
      entryId,
      buildBatchUsageEntryResult(blockersByType.get(entryId) ?? []),
    ]),
  )
}

/** Species referencing a creature type id — used for usage counts and disable/delete blockers. */
export async function resolveCreatureTypeSpeciesUsage(
  campaignId: string,
  entryId: string,
): Promise<{ count: number; blockers: ContentUsageBlocker[] }> {
  const blockersByType = await loadSpeciesBlockersByCreatureType(campaignId)
  const blockers = blockersByType.get(entryId) ?? []

  return { count: blockers.length, blockers }
}
