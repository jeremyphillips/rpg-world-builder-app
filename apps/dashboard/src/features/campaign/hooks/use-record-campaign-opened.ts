import { useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { touchCampaignOpened } from '../api/campaign-client'
import { campaignsQueryKey } from './use-campaigns'

/** Canonical recency write — call from campaign shell layout on entry only. */
export function useRecordCampaignOpened(campaignId: string | undefined): void {
  const queryClient = useQueryClient()
  const lastRecordedIdRef = useRef<string | undefined>(undefined)

  const { mutate } = useMutation({
    mutationFn: touchCampaignOpened,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: campaignsQueryKey })
    },
  })

  useEffect(() => {
    if (!campaignId || lastRecordedIdRef.current === campaignId) {
      return
    }

    lastRecordedIdRef.current = campaignId
    mutate(campaignId, {
      onError: () => {
        lastRecordedIdRef.current = undefined
      },
    })
  }, [campaignId, mutate])
}
