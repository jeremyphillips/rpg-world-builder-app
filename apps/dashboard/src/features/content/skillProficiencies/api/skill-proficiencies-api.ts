import type { SkillProficiency } from '@rpg/contracts'
import { request } from '@/lib/api-client'

/** List all skill proficiencies (system + homebrew) available in a campaign's ruleset. */
export async function listSkillProficiencies(campaignId: string): Promise<SkillProficiency[]> {
  const { skillProficiencies } = await request<{ skillProficiencies: SkillProficiency[] }>(
    `/api/campaigns/${campaignId}/content/skill-proficiencies`,
    undefined,
    'Could not load skill proficiencies.',
  )
  return skillProficiencies
}
