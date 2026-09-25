import type { ContentMediaDomain } from './media-policy'

export const CONTENT_DISPLAY_FALLBACKS = [
  'character',
  'location',
  'organization',
  'campaign',
  'equipment',
  'generic',
] as const

export type ContentDisplayFallback = (typeof CONTENT_DISPLAY_FALLBACKS)[number]

const DOMAIN_CONTENT_DISPLAY_FALLBACK: Record<ContentMediaDomain, ContentDisplayFallback> = {
  character: 'character',
  location: 'location',
  organization: 'organization',
  campaign: 'campaign',
  equipment: 'equipment',
  class: 'generic',
  species: 'generic',
}

/** Semantic empty-state key for a content media domain (UI maps to icons). */
export function resolveContentDisplayFallbackForDomain(
  domain: ContentMediaDomain,
): ContentDisplayFallback {
  return DOMAIN_CONTENT_DISPLAY_FALLBACK[domain]
}
