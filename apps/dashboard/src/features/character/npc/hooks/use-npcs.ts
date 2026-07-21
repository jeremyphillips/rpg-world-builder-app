import { useQuery } from '@tanstack/react-query'

import { getNpc, listNpcs } from '../api/npc-client'

export function npcsQueryKey(campaignId: string | undefined) {
  return ['campaigns', campaignId, 'npcs'] as const
}

export function npcQueryKey(campaignId: string | undefined, npcId: string | undefined) {
  return ['campaigns', campaignId, 'npcs', npcId] as const
}

/** Load every NPC in a campaign (owner/co-owner). */
export function useNpcs(campaignId: string | undefined) {
  return useQuery({
    queryKey: campaignId ? npcsQueryKey(campaignId) : [],
    queryFn: () => listNpcs(campaignId!),
    enabled: Boolean(campaignId),
  })
}

/** Load a single campaign NPC by id (owner/co-owner). */
export function useNpc(campaignId: string | undefined, npcId: string | undefined) {
  return useQuery({
    queryKey: campaignId && npcId ? npcQueryKey(campaignId, npcId) : [],
    queryFn: () => getNpc(campaignId!, npcId!),
    enabled: Boolean(campaignId && npcId),
  })
}
