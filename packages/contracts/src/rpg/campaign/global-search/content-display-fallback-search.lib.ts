import type { GlobalSearchTarget } from './global-search-target'
import type { ContentDisplayFallback } from '../../primitives/media/content-display-fallback'

const SEARCH_TARGET_FALLBACK = {
  class: 'class',
  spell: 'spell',
  species: 'species',
  feat: 'feat',
  equipment: 'equipment',
  'skill-proficiency': 'skill-proficiency',
  organization: 'organization',
  location: 'location',
  'game-term': 'game-term',
} as const satisfies Record<
  Exclude<GlobalSearchTarget['kind'], 'character'>,
  ContentDisplayFallback
>

/** Maps structured search targets to compact/search fallback keys. */
export function resolveContentDisplayFallbackForSearchTarget(
  target: GlobalSearchTarget,
): ContentDisplayFallback {
  if (target.kind === 'character') {
    return target.characterType === 'npc' ? 'npc' : 'character'
  }

  return SEARCH_TARGET_FALLBACK[target.kind]
}
