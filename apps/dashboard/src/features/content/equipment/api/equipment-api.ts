import type { Equipment } from '@rpg/contracts'
import { request } from '@/lib/api-client'

/** List all equipment (system + homebrew) available in a campaign's ruleset. */
export async function listEquipment(campaignId: string): Promise<Equipment[]> {
  const { equipment } = await request<{ equipment: Equipment[] }>(
    `/api/campaigns/${campaignId}/content/equipment`,
    undefined,
    'Could not load equipment.',
  )
  return equipment
}
