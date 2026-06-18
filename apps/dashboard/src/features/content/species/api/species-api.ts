import type { Species } from '@rpg/contracts'
import { request } from '@/lib/api-client'

/** List all species (system + homebrew) available in a campaign's ruleset. */
export async function listSpecies(campaignId: string): Promise<Species[]> {
  const { species } = await request<{ species: Species[] }>(
    `/api/campaigns/${campaignId}/content/species`,
    undefined,
    'Could not load species.',
  )
  return species
}
