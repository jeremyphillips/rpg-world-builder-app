import type { ContentUsageBlocker } from '@rpg/contracts'

import { resolveCatalogForCampaign } from '../../content/content.service'
import { speciesWriteConfig } from '../../content/species/species.config'

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
