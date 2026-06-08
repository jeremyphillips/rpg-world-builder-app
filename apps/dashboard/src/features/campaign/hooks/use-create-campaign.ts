import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { Campaign } from '@rpg/contracts'

import { createCampaign } from '../api/campaign-client'

/** Create a campaign, then navigate to its detail route on success. */
export function useCreateCampaign() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: (campaign: Campaign) => navigate(`/campaigns/${campaign.id}`),
  })
}
