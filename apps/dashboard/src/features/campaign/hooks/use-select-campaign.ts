import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { sessionQueryKey } from '@/features/auth'

import { rememberSelectedCampaign } from '../api/campaign-client'
import { resolveTargetPathOnSwitch } from '../lib/navigation/campaign-selection'
import { writeStoredCampaignId } from '../lib/navigation/selected-campaign-storage'
import { useCampaignStore } from '../store/campaign-store'

/**
 * Returns a `selectCampaign(id)` action. Behaviour depends on the current
 * route:
 *
 * - On a campaign-scoped route (`/campaigns/:campaignId/...`): navigate to the
 *   equivalent section for the new campaign, stripping entity-specific ids that
 *   cannot transfer across campaigns.
 * - On any other route: update the store and persist — no navigation. The user
 *   stays where they are; the new campaign becomes active for when they next
 *   enter a campaign section.
 *
 * In both cases localStorage and the server preference are updated so the
 * choice survives a page reload.
 */
export function useSelectCampaign() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { campaignId: currentCampaignId } = useParams<{ campaignId?: string }>()
  const queryClient = useQueryClient()
  const setActiveCampaignId = useCampaignStore((s) => s.setActiveCampaignId)

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
      setActiveCampaignId(campaignId)

      if (currentCampaignId) {
        navigate(resolveTargetPathOnSwitch(pathname, currentCampaignId, campaignId))
      }
    },
    [mutate, navigate, pathname, currentCampaignId, setActiveCampaignId],
  )
}
