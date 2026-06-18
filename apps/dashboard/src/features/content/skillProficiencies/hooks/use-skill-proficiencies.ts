import { useQuery } from '@tanstack/react-query'
import { listSkillProficiencies } from '../api/skill-proficiencies-api'

export const skillProficienciesQueryKey = (campaignId: string) =>
  ['campaigns', campaignId, 'content', 'skill-proficiencies'] as const

/** Load all skill proficiencies available in the given campaign (system seed + homebrew). */
export function useSkillProficiencies(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignId ? skillProficienciesQueryKey(campaignId) : [],
    queryFn: () => listSkillProficiencies(campaignId!),
    enabled: Boolean(campaignId),
  })
}
