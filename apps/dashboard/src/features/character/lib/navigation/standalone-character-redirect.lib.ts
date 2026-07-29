import type { CampaignIdRef, CharacterRoutingContextResponse } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

/** Recognized standalone → campaign redirect query params (extend when deep links ship). */
export const STANDALONE_CHARACTER_REDIRECT_QUERY_KEYS = [] as const

export function buildStandaloneCharacterRedirectSearch(searchParams: URLSearchParams): string {
  const preserved = new URLSearchParams()
  for (const key of STANDALONE_CHARACTER_REDIRECT_QUERY_KEYS) {
    const value = searchParams.get(key)
    if (value !== null) preserved.set(key, value)
  }
  const serialized = preserved.toString()
  return serialized ? `?${serialized}` : ''
}

export function resolveStandaloneCharacterRedirectTarget(input: {
  characterId: string
  routingContext: CharacterRoutingContextResponse | undefined
  campaigns: readonly CampaignIdRef[] | undefined
  search: string
}): string | null {
  const openCampaignId = input.routingContext?.openCampaign?.id
  if (!openCampaignId || !input.campaigns) return null

  const isMember = input.campaigns.some((campaign) => campaign.id === openCampaignId)
  if (!isMember) return null

  return `${ROUTES.campaign.characters.detail(openCampaignId, input.characterId)}${input.search}`
}
