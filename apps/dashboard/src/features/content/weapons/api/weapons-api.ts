import type { Weapon } from '@rpg/contracts'
import { request } from '@/lib/api-client'

/** List all weapons (system + homebrew) available in a campaign's ruleset. */
export async function listWeapons(campaignId: string): Promise<Weapon[]> {
  const { weapons } = await request<{ weapons: Weapon[] }>(
    `/api/campaigns/${campaignId}/content/weapons`,
    undefined,
    'Could not load weapons.',
  )
  return weapons
}
