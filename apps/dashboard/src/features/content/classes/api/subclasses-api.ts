import type { Subclass } from '@rpg/contracts'
import { request } from '@/lib/api-client'

/** List all subclasses belonging to a specific class in a campaign's ruleset. */
export async function fetchSubclasses(campaignId: string, classId: string): Promise<Subclass[]> {
  const { subclasses } = await request<{ subclasses: Subclass[] }>(
    `/api/campaigns/${campaignId}/content/classes/${classId}/subclasses`,
    undefined,
    'Could not load subclasses.',
  )
  return subclasses
}
