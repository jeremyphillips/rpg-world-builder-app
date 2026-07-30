export const CAMPAIGN_DISPLAY_FALLBACK_NAME = 'Campaign' as const

export type CampaignDisplayVM = {
  id: string
  name: string
  imageUrl: string | null
}

export type CampaignDisplayInput = {
  id: string
  identity?: { name: string }
  name?: string
}

/** Trim campaign copy for display. Never substitutes the fallback name. */
export function normalizeCampaignDisplayName(name: string): string {
  return name.trim()
}

/** Maps campaign list/detail shapes to a display-only view model. */
export function buildCampaignDisplay(input: CampaignDisplayInput): CampaignDisplayVM {
  const rawName = input.identity?.name ?? input.name ?? ''

  return {
    id: input.id,
    name: normalizeCampaignDisplayName(rawName),
    imageUrl: null,
  }
}
