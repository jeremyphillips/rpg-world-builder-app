import type { CampaignNpcListItem } from '@rpg/contracts'
import type { QueryClient } from '@tanstack/react-query'

import { listNpcs } from '../api/npc-client'
import { npcsQueryKey } from '../hooks/use-npcs'

/** Imperatively load campaign NPCs with canonical query/cache behavior. */
export async function fetchCampaignNpcs(
  queryClient: QueryClient,
  campaignId: string,
): Promise<CampaignNpcListItem[]> {
  return queryClient.fetchQuery({
    queryKey: npcsQueryKey(campaignId),
    queryFn: () => listNpcs(campaignId),
  })
}

/** Invalidate cached campaign NPC list queries after nested create or roster changes. */
export async function invalidateCampaignNpcQueries(
  queryClient: QueryClient,
  campaignId: string,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: npcsQueryKey(campaignId) })
}
