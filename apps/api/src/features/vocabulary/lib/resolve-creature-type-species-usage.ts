import type { ContentUsageBlocker } from '@rpg/contracts'

import { resolveCatalogForCampaign } from '../../content/content.service'
import { speciesWriteConfig } from '../../content/species/species.config'

async function loadSpeciesUsageCountsByCreatureType(
  campaignId: string,
): Promise<Map<string, number>> {
  const species = await resolveCatalogForCampaign(speciesWriteConfig.readConfig, campaignId)
  const counts = new Map<string, number>()

  for (const record of species) {
    counts.set(record.creatureType, (counts.get(record.creatureType) ?? 0) + 1)
  }

  return counts
}

/** Count-only batch resolver for overview loads — one species catalog read per set. */
export async function resolveCreatureTypeSpeciesUsageCountsBatch(
  campaignId: string,
  entryIds: readonly string[],
): Promise<Map<string, number>> {
  const countsByType = await loadSpeciesUsageCountsByCreatureType(campaignId)

  return new Map(entryIds.map((entryId) => [entryId, countsByType.get(entryId) ?? 0]))
}

/** Species referencing a creature type id — used for usage counts and disable/delete blockers. */
export async function resolveCreatureTypeSpeciesUsage(
  campaignId: string,
  entryId: string,
): Promise<{ count: number; blockers: ContentUsageBlocker[] }> {
  const species = await resolveCatalogForCampaign(speciesWriteConfig.readConfig, campaignId)
  const matching = species.filter((record) => record.creatureType === entryId)

  const blockers: ContentUsageBlocker[] = matching.map((record) => ({
    kind: 'content',
    contentTypeKey: 'species',
    id: record.id,
    label: record.name,
    slug: record.slug,
  }))

  return { count: blockers.length, blockers }
}
