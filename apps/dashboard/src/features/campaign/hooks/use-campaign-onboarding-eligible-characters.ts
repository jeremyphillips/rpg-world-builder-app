import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CompleteCampaignOnboardingInput } from '@rpg/contracts'

import {
  completeCampaignOnboarding,
  fetchCampaignEligibleCharacters,
} from '../api/campaign-onboarding-client'
import { campaignMembersQueryKey } from './use-campaign-members'
import { campaignOnboardingContextQueryKey } from './use-campaign-onboarding-context'
import { invalidateCampaignCharacterControlQueries } from '../lib/characters/invalidate-campaign-character-control-queries'

export const campaignOnboardingEligibleCharactersQueryKey = (campaignId: string) =>
  ['campaigns', campaignId, 'onboarding-eligible-characters'] as const

export function useCampaignOnboardingEligibleCharacters(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignOnboardingEligibleCharactersQueryKey(campaignId ?? ''),
    queryFn: () => fetchCampaignEligibleCharacters(campaignId!),
    enabled: Boolean(campaignId),
  })
}

export function useCompleteCampaignOnboarding(campaignId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CompleteCampaignOnboardingInput) =>
      completeCampaignOnboarding(campaignId!, input),
    onSuccess: async (result) => {
      if (!campaignId) return
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: campaignOnboardingContextQueryKey(campaignId) }),
        queryClient.invalidateQueries({
          queryKey: campaignOnboardingEligibleCharactersQueryKey(campaignId),
        }),
        queryClient.invalidateQueries({ queryKey: campaignMembersQueryKey(result.campaignId) }),
        invalidateCampaignCharacterControlQueries(queryClient, {
          campaignId: result.campaignId,
          characterId: result.characterId,
        }),
      ])
    },
  })
}
