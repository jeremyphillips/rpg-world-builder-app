import type { Armor } from '@rpg/contracts'
import { request } from '@/lib/api-client'

/** List all armor (system + homebrew) available in a campaign's ruleset. */
export async function listArmor(campaignId: string): Promise<Armor[]> {
  const { armor } = await request<{ armor: Armor[] }>(
    `/api/campaigns/${campaignId}/content/armor`,
    undefined,
    'Could not load armor.',
  )
  return armor
}
