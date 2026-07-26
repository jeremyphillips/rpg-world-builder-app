import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CreateCharacterInput } from '@rpg/contracts'

import {
  completeCampaignInviteWithExistingCharacter,
  completeCampaignInviteWithNewCharacter,
  fetchEligibleCharactersForInvite,
} from '../api/campaign-invite-client'
import { campaignInviteOnboardingContextQueryKey } from './use-campaign-invite-onboarding-context'
import { campaignMembersQueryKey } from './use-campaign-members'
import { campaignPartyQueryKey } from './use-campaign-party'

export const campaignInviteEligibleCharactersQueryKey = (inviteId: string) =>
  ['campaign-invite', 'eligible-characters', inviteId] as const

export function useCampaignInviteEligibleCharacters(inviteId: string | undefined) {
  return useQuery({
    queryKey: campaignInviteEligibleCharactersQueryKey(inviteId ?? ''),
    queryFn: () => fetchEligibleCharactersForInvite(inviteId!),
    enabled: Boolean(inviteId),
  })
}

export function useCompleteCampaignInviteWithExistingCharacter(inviteId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (characterId: string) =>
      completeCampaignInviteWithExistingCharacter({
        inviteId: inviteId!,
        characterId,
      }),
    onSuccess: async (result) => {
      if (!inviteId) return
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: campaignInviteOnboardingContextQueryKey(inviteId),
        }),
        queryClient.invalidateQueries({ queryKey: campaignMembersQueryKey(result.campaignId) }),
        queryClient.invalidateQueries({ queryKey: campaignPartyQueryKey(result.campaignId) }),
      ])
    },
  })
}

export function useCompleteCampaignInviteWithNewCharacter(inviteId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (characterCreateInput: CreateCharacterInput) =>
      completeCampaignInviteWithNewCharacter({
        inviteId: inviteId!,
        characterCreateInput,
      }),
    onSuccess: async (result) => {
      if (!inviteId) return
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: campaignInviteOnboardingContextQueryKey(inviteId),
        }),
        queryClient.invalidateQueries({ queryKey: campaignMembersQueryKey(result.campaignId) }),
        queryClient.invalidateQueries({ queryKey: campaignPartyQueryKey(result.campaignId) }),
      ])
    },
  })
}
