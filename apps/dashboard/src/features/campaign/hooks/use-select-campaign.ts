import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { sessionQueryKey } from '@/features/auth'

import { rememberSelectedCampaign } from '../api/campaign-client'
import { resolveTargetPathOnSwitch } from '../lib/navigation/campaign-selection'
import { writeStoredCampaignId } from '../lib/navigation/selected-campaign-storage'
import { useCampaignStore } from '../store/campaign-store'

/**
 * Returns a `selectCampaign(id)` action. Persists the user's preference and
 * navigates to the equivalent campaign section when already on a campaign route,
 * otherwise to the campaign overview landing page.
 */
export function useSelectCampaign() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { campaignId: currentCampaignId } = useParams<{ campaignId?: string }>()
  const queryClient = useQueryClient()
  const setPreferredCampaignId = useCampaignStore((state) => state.setPreferredCampaignId)

  const { mutate } = useMutation({
    mutationFn: rememberSelectedCampaign,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionQueryKey })
    },
  })

  return useCallback(
    (campaignId: string) => {
      writeStoredCampaignId(campaignId)
      mutate(campaignId)
      setPreferredCampaignId(campaignId)

      if (currentCampaignId) {
        navigate(resolveTargetPathOnSwitch(pathname, currentCampaignId, campaignId))
        return
      }

      navigate(ROUTES.campaign.detail(campaignId))
    },
    [mutate, navigate, pathname, currentCampaignId, setPreferredCampaignId],
  )
}
