import type { GlobalSearchTarget } from '../../rpg/campaign/global-search/global-search-target'
import type { ContentDisplaySurface } from './content-display-surface'
import type { ContentMediaDomain } from './media-policy'

export const CONTENT_DISPLAY_FALLBACKS = [
  'character',
  'npc',
  'location',
  'organization',
  'campaign',
  'equipment',
  'class',
  'species',
  'spell',
  'feat',
  'skill-proficiency',
  'game-term',
  'generic',
] as const

export type ContentDisplayFallback = (typeof CONTENT_DISPLAY_FALLBACKS)[number]

/** Fallback subjects — opted-in media domains plus non-media catalog kinds. */
export type ContentDisplayFallbackSubject =
  | ContentMediaDomain
  | 'spell'
  | 'feat'
  | 'skill-proficiency'
  | 'game-term'

export type ContentDisplayFallbackSurface = ContentDisplaySurface | 'search'

export type ResolveContentDisplayFallbackInput = {
  domain: ContentDisplayFallbackSubject
  surface: ContentDisplayFallbackSurface
  characterType?: 'pc' | 'npc'
}

function isCompactIdentitySurface(surface: ContentDisplayFallbackSurface): boolean {
  return surface === 'compact' || surface === 'search'
}

const MEDIA_DOMAIN_COMPACT_FALLBACK: Record<ContentMediaDomain, ContentDisplayFallback> = {
  character: 'character',
  location: 'location',
  organization: 'organization',
  campaign: 'campaign',
  equipment: 'equipment',
  class: 'class',
  species: 'species',
}

function resolveMediaDomainFallback(
  domain: ContentMediaDomain,
  surface: ContentDisplayFallbackSurface,
): ContentDisplayFallback {
  if (isCompactIdentitySurface(surface)) {
    return MEDIA_DOMAIN_COMPACT_FALLBACK[domain]
  }

  if (domain === 'class' || domain === 'species') {
    return 'generic'
  }

  return MEDIA_DOMAIN_COMPACT_FALLBACK[domain]
}

/** Surface-aware semantic empty-state key (UI maps to icons). */
export function resolveContentDisplayFallback(
  input: ResolveContentDisplayFallbackInput,
): ContentDisplayFallback {
  const { domain, surface, characterType } = input

  if (domain === 'character') {
    if (isCompactIdentitySurface(surface) && characterType === 'npc') {
      return 'npc'
    }
    return 'character'
  }

  if (
    domain === 'spell' ||
    domain === 'feat' ||
    domain === 'skill-proficiency' ||
    domain === 'game-term'
  ) {
    return domain
  }

  return resolveMediaDomainFallback(domain, surface)
}

/** Maps structured search targets to the shared fallback resolver (`surface: 'search'`). */
export function resolveContentDisplayFallbackForSearchTarget(
  target: GlobalSearchTarget,
): ContentDisplayFallback {
  switch (target.kind) {
    case 'character':
      return resolveContentDisplayFallback({
        domain: 'character',
        surface: 'search',
        characterType: target.characterType,
      })
    case 'class':
      return resolveContentDisplayFallback({ domain: 'class', surface: 'search' })
    case 'spell':
      return resolveContentDisplayFallback({ domain: 'spell', surface: 'search' })
    case 'species':
      return resolveContentDisplayFallback({ domain: 'species', surface: 'search' })
    case 'feat':
      return resolveContentDisplayFallback({ domain: 'feat', surface: 'search' })
    case 'equipment':
      return resolveContentDisplayFallback({ domain: 'equipment', surface: 'search' })
    case 'skill-proficiency':
      return resolveContentDisplayFallback({ domain: 'skill-proficiency', surface: 'search' })
    case 'organization':
      return resolveContentDisplayFallback({ domain: 'organization', surface: 'search' })
    case 'location':
      return resolveContentDisplayFallback({ domain: 'location', surface: 'search' })
    case 'game-term':
      return resolveContentDisplayFallback({ domain: 'game-term', surface: 'search' })
    default: {
      const _exhaustive: never = target
      return _exhaustive
    }
  }
}
