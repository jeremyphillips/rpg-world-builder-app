import { useMutation, useQueryClient } from '@tanstack/react-query'

import type { UpdateCampaignInput } from '@rpg/contracts'
import { updateCampaign } from '../api/campaign-client'
import { campaignsQueryKey } from './use-campaigns'

/**
 * Update a campaign's identity, settings, or flavor and refresh the campaign
 * list. Pass a partial `UpdateCampaignInput`; the server merges the patch.
 */
export function useUpdateCampaign(campaignId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateCampaignInput) => updateCampaign(campaignId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: campaignsQueryKey })
    },
  })
}
