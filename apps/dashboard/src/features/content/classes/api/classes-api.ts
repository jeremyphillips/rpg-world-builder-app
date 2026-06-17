import type { CharacterClass } from '@rpg/contracts'
import { request } from '@/lib/api-client'

/** List all classes (system + homebrew) available in a campaign's ruleset. */
export async function listClasses(campaignId: string): Promise<CharacterClass[]> {
  const { classes } = await request<{ classes: CharacterClass[] }>(
    `/api/campaigns/${campaignId}/content/classes`,
    undefined,
    'Could not load classes.',
  )
  return classes
}
