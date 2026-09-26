export const CAMPAIGN_UNKNOWN_NAME = 'Unknown campaign' as const

/** @deprecated Use CAMPAIGN_UNKNOWN_NAME */
export const CAMPAIGN_DISPLAY_FALLBACK_NAME = CAMPAIGN_UNKNOWN_NAME

import type { ContentMedia } from '@rpg/contracts'

import { resolveCampaignEmblemImageUrl } from './overview/campaign-overview-hero-media.lib'

export const CAMPAIGNS_QUERY_ERROR_MESSAGE = "Couldn't load campaigns" as const

export type CampaignDisplayVM = {
  id: string
  name: string
  imageUrl: string | null
}

export type CampaignDisplayInput = {
  id: string
  identity?: { name: string; media?: ContentMedia }
  name?: string
  /** Pre-resolved emblem URL when media is unavailable on the input shape. */
  emblemUrl?: string
}

/** Trim campaign copy for display. Never substitutes the unknown name. */
export function normalizeCampaignDisplayName(name: string): string {
  return name.trim()
}

/** Maps campaign list/detail shapes to a display-only view model. */
export function buildCampaignDisplay(input: CampaignDisplayInput): CampaignDisplayVM {
  const rawName = input.identity?.name ?? input.name ?? ''

  const emblemUrl = input.emblemUrl ?? resolveCampaignEmblemImageUrl(input.identity?.media) ?? null

  return {
    id: input.id,
    name: normalizeCampaignDisplayName(rawName),
    imageUrl: emblemUrl,
  }
}
