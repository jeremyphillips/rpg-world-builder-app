import type { QueryClient } from '@tanstack/react-query'

import { getErrorMessage } from '@rpg/contracts'
import type { Location } from '@rpg/contracts/rpg/content'

import { listCampaignCharacters } from '@/features/campaign/api/campaign-characters-client'
import { campaignCharactersListQueryKey } from '@/features/campaign/hooks/use-campaign-characters'
import { formatContentListLoadErrorMessage } from '@/features/content'
import { listLocations } from '@/features/content/locations/api/locations-api'
import { locationsQueryKey } from '@/features/content/locations/hooks/use-locations'

export type NarrativeGenerationCampaignContextFailureReason =
  | 'narrative-locations-load-failed'
  | 'narrative-characters-load-failed'

export type NarrativeGenerationCampaignContextSuccess = {
  ok: true
  locations: Location[]
  characters: readonly { id: string; name: string }[]
}

export type NarrativeGenerationCampaignContextFailure = {
  ok: false
  reason: NarrativeGenerationCampaignContextFailureReason
  error: unknown
}

export type NarrativeGenerationCampaignContextResult =
  | NarrativeGenerationCampaignContextSuccess
  | NarrativeGenerationCampaignContextFailure

export function formatNarrativeGenerationCampaignContextFailure(
  reason: NarrativeGenerationCampaignContextFailureReason,
  error: unknown,
): string {
  if (reason === 'narrative-locations-load-failed') {
    return getErrorMessage(error, formatContentListLoadErrorMessage('locations'))
  }
  return getErrorMessage(error, 'Campaign characters could not be loaded.')
}

/** Loads campaign locations and character names for narrative generation context. */
export async function fetchNarrativeGenerationCampaignContext(
  queryClient: QueryClient,
  campaignId: string,
): Promise<NarrativeGenerationCampaignContextResult> {
  let locations: Location[]
  try {
    const result = await queryClient.fetchQuery({
      queryKey: locationsQueryKey(campaignId),
      queryFn: () => listLocations(campaignId),
    })
    locations = result.items
  } catch (error) {
    return { ok: false, reason: 'narrative-locations-load-failed', error }
  }

  try {
    const characters = await queryClient.fetchQuery({
      queryKey: campaignCharactersListQueryKey(campaignId),
      queryFn: () => listCampaignCharacters(campaignId),
    })
    return {
      ok: true,
      locations,
      characters: characters.map(({ character }) => ({ id: character.id, name: character.name })),
    }
  } catch (error) {
    return { ok: false, reason: 'narrative-characters-load-failed', error }
  }
}
