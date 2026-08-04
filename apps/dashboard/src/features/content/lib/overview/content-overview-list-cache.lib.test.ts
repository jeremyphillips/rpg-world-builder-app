import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'
import type { ResolvedContentCampaignAccess } from '@rpg/contracts'

import { patchContentOverviewListCampaignAccess } from './content-overview-list-cache.lib'
import { contentOverviewListQueryKey } from './content-overview-query-keys'

const baseAccess: ResolvedContentCampaignAccess = {
  available: true,
  visibilityMode: 'all_players',
  participantIds: [],
  unavailableParticipantIds: [],
  effectiveAudience: 'all_players',
}

const nextAccess: ResolvedContentCampaignAccess = {
  available: false,
  visibilityMode: 'all_players',
  participantIds: [],
  unavailableParticipantIds: [],
  effectiveAudience: 'none',
}

describe('patchContentOverviewListCampaignAccess', () => {
  it('updates campaignAccess on the matching row inside ContentListResult.items', () => {
    const queryClient = new QueryClient()
    const campaignId = 'camp_1'
    const queryKey = contentOverviewListQueryKey(campaignId, 'classes')

    queryClient.setQueryData(queryKey, {
      items: [
        { id: 'class_a', name: 'Fighter', campaignAccess: baseAccess },
        { id: 'class_b', name: 'Wizard', campaignAccess: baseAccess },
      ],
    })

    patchContentOverviewListCampaignAccess(
      queryClient,
      campaignId,
      'classes',
      'class_a',
      nextAccess,
    )

    const cached = queryClient.getQueryData<{
      items: Array<{ id: string; campaignAccess: ResolvedContentCampaignAccess }>
    }>(queryKey)

    expect(cached?.items[0]?.campaignAccess).toEqual(nextAccess)
    expect(cached?.items[1]?.campaignAccess).toEqual(baseAccess)
  })

  it('leaves cache unchanged when list data is not loaded', () => {
    const queryClient = new QueryClient()
    const campaignId = 'camp_1'
    const queryKey = contentOverviewListQueryKey(campaignId, 'classes')

    patchContentOverviewListCampaignAccess(
      queryClient,
      campaignId,
      'classes',
      'class_a',
      nextAccess,
    )

    expect(queryClient.getQueryData(queryKey)).toBeUndefined()
  })
})
