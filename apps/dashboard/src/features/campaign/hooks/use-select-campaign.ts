import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ROUTES } from '@/app/routes'
import { sessionQueryKey } from '@/features/auth'

import { rememberSelectedCampaign } from '../api/campaign-client'
import { resolveTargetPathOnSwitch } from '../lib/navigation/campaign-selection'
import { writeStoredCampaignId } from '../lib/navigation/selected-campaign-storage'
import { useCampaignStore } from '../store/campaign-store'

/** Persists the user's campaign selection preference without navigating. */
export function usePersistCampaignSelection() {
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
    },
    [mutate, setPreferredCampaignId],
  )
}

/** Opens a campaign at Overview and persists the user's selection preference. */
export function useOpenCampaign() {
  const navigate = useNavigate()
  const persistSelection = usePersistCampaignSelection()

  return useCallback(
    (campaignId: string) => {
      persistSelection(campaignId)
      navigate(ROUTES.campaign.detail(campaignId))
    },
    [navigate, persistSelection],
  )
}

/** Switches campaigns while preserving the current section when on a campaign route. */
export function useSwitchCampaign() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { campaignId: currentCampaignId } = useParams<{ campaignId?: string }>()
  const persistSelection = usePersistCampaignSelection()

  return useCallback(
    (campaignId: string) => {
      persistSelection(campaignId)

      if (currentCampaignId) {
        navigate(resolveTargetPathOnSwitch(pathname, currentCampaignId, campaignId))
        return
      }

      navigate(ROUTES.campaign.detail(campaignId))
    },
    [currentCampaignId, navigate, pathname, persistSelection],
  )
}
