import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { persistCampaignSelectionLocal, persistCampaignSelectionRemote } from '@rpg/api-client'

import { ROUTES } from '@/app/routes'
import { sessionQueryKey } from '@/features/auth'

import {
  resolveCampaignEntryDestination,
  resolveSwitchCampaignPath,
} from '../lib/recovery/campaign-destination.lib'
import { useCampaignStore } from '../store/campaign-store'
import { useCampaigns } from './use-campaigns'

/** Persists the user's campaign selection preference without navigating. */
export function usePersistCampaignSelection() {
  const queryClient = useQueryClient()
  const setPreferredCampaignId = useCampaignStore((state) => state.setPreferredCampaignId)

  const { mutateAsync } = useMutation({
    mutationFn: persistCampaignSelectionRemote,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: sessionQueryKey })
    },
  })

  return useCallback(
    (campaignId: string) => {
      persistCampaignSelectionLocal(campaignId)
      setPreferredCampaignId(campaignId)
      void mutateAsync(campaignId).catch(() => {
        // Recovery UI works from local storage; server sync is best-effort.
      })
    },
    [mutateAsync, setPreferredCampaignId],
  )
}

/** Opens a campaign and persists the user's selection preference. */
export function useOpenCampaign() {
  const navigate = useNavigate()
  const persistSelection = usePersistCampaignSelection()
  const { data: campaigns } = useCampaigns()

  return useCallback(
    (campaignId: string) => {
      persistSelection(campaignId)
      const campaign = campaigns?.find((item) => item.id === campaignId)
      const href = campaign
        ? resolveCampaignEntryDestination(campaign).href
        : ROUTES.campaign.detail(campaignId)
      navigate(href)
    },
    [campaigns, navigate, persistSelection],
  )
}

/** Switches campaigns while preserving the current section when on a campaign route. */
export function useSwitchCampaign() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { campaignId: currentCampaignId } = useParams<{ campaignId?: string }>()
  const persistSelection = usePersistCampaignSelection()
  const { data: campaigns } = useCampaigns()

  return useCallback(
    (campaignId: string) => {
      persistSelection(campaignId)

      const campaign = campaigns?.find((item) => item.id === campaignId)
      if (currentCampaignId && campaign) {
        navigate(resolveSwitchCampaignPath(pathname, currentCampaignId, campaign))
        return
      }

      const href = campaign
        ? resolveCampaignEntryDestination(campaign).href
        : ROUTES.campaign.detail(campaignId)
      navigate(href)
    },
    [campaigns, currentCampaignId, navigate, pathname, persistSelection],
  )
}
