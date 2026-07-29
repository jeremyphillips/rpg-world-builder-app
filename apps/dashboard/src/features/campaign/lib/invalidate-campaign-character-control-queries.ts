import type { QueryClient } from '@tanstack/react-query'

import { charactersQueryKey } from '@/features/character'

import { campaignCharacterQueryKey } from '../hooks/use-campaign-character'
import { campaignCharactersListQueryKey } from '../hooks/use-campaign-characters'
import { campaignsQueryKey } from '../hooks/use-campaigns'
import { campaignPartyQueryKey } from '../hooks/use-campaign-party'

/** Invalidate queries affected by campaign character control assignment changes. */
export async function invalidateCampaignCharacterControlQueries(
  queryClient: QueryClient,
  input: { campaignId: string; characterId?: string },
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: campaignCharactersListQueryKey(input.campaignId),
    }),
    queryClient.invalidateQueries({ queryKey: campaignPartyQueryKey(input.campaignId) }),
    queryClient.invalidateQueries({ queryKey: campaignsQueryKey }),
    queryClient.invalidateQueries({ queryKey: charactersQueryKey }),
    ...(input.characterId
      ? [
          queryClient.invalidateQueries({
            queryKey: campaignCharacterQueryKey(input.campaignId, input.characterId),
          }),
        ]
      : []),
  ])
}
