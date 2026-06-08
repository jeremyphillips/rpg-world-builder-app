import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { SessionUser } from '@rpg/contracts'

import { sessionQueryKey } from '@/features/auth'

import { rememberSelectedCampaign } from '../api/campaign-client'
import { writeStoredCampaignId } from '../lib/selected-campaign-storage'

/**
 * Returns a `selectCampaign(id)` action. Selecting a campaign is just a
 * navigation (the URL is the source of truth); alongside it we persist the
 * choice to localStorage and the server so a returning user lands back here.
 * The server write is fire-and-forget - navigation never waits on it.
 */
export function useSelectCampaign() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: rememberSelectedCampaign,
    onSuccess: (user: SessionUser) => {
      queryClient.setQueryData(sessionQueryKey, user)
    },
  })

  return useCallback(
    (campaignId: string) => {
      writeStoredCampaignId(campaignId)
      mutate(campaignId)
      navigate(`/campaigns/${campaignId}`)
    },
    [mutate, navigate],
  )
}
