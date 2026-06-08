import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createCampaign } from '../api/campaign-client'
import { campaignsQueryKey } from './use-campaigns'

/**
 * Create a campaign and refresh the campaign list. Selection + navigation are
 * the caller's responsibility (the URL is the source of truth), so the form
 * calls `selectCampaign(campaign.id)` in its own success handler.
 */
export function useCreateCampaign() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: campaignsQueryKey })
    },
  })
}
