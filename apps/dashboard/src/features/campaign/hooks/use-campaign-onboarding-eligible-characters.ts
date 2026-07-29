import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CompleteCampaignOnboardingInput } from '@rpg/contracts'

import { charactersQueryKey } from '@/features/character'

import {
  completeCampaignOnboarding,
  fetchCampaignEligibleCharacters,
} from '../api/campaign-onboarding-client'
import { campaignCharacterQueryKey } from './use-campaign-character'
import { campaignsQueryKey } from './use-campaigns'
import { campaignMembersQueryKey } from './use-campaign-members'
import { campaignOnboardingContextQueryKey } from './use-campaign-onboarding-context'
import { campaignPartyQueryKey } from './use-campaign-party'

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
        queryClient.invalidateQueries({ queryKey: campaignPartyQueryKey(result.campaignId) }),
        queryClient.invalidateQueries({ queryKey: campaignsQueryKey }),
        queryClient.invalidateQueries({ queryKey: charactersQueryKey }),
        queryClient.invalidateQueries({
          queryKey: campaignCharacterQueryKey(result.campaignId, result.characterId),
        }),
      ])
    },
  })
}
