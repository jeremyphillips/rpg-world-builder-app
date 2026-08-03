import type { GlobalSearchTarget } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

type ContentDetailRoute = (campaignId: string, id: string) => string

/** Content targets resolved with a single entity id. */
const CONTENT_DETAIL_ROUTES = {
  class: ROUTES.content.classes.detail,
  spell: ROUTES.content.spells.detail,
  species: ROUTES.content.species.detail,
  feat: ROUTES.content.feats.detail,
  'skill-proficiency': ROUTES.content.skillProficiencies.detail,
  organization: ROUTES.content.organizations.detail,
  location: ROUTES.content.locations.detail,
} as const satisfies Record<string, ContentDetailRoute>

type ContentDetailTargetKind = keyof typeof CONTENT_DETAIL_ROUTES

function isContentDetailTarget(
  target: GlobalSearchTarget,
): target is Extract<GlobalSearchTarget, { kind: ContentDetailTargetKind }> {
  return target.kind in CONTENT_DETAIL_ROUTES
}

/** Maps a structured wire target to a dashboard href for the active campaign. */
export function resolveGlobalSearchHref(campaignId: string, target: GlobalSearchTarget): string {
  if (isContentDetailTarget(target)) {
    return CONTENT_DETAIL_ROUTES[target.kind](campaignId, target.id)
  }

  switch (target.kind) {
    case 'equipment':
      return ROUTES.content.equipment.detail(campaignId, target.family, target.id)
    case 'character':
      return target.characterType === 'npc'
        ? ROUTES.campaign.npcs.detail(campaignId, target.id)
        : ROUTES.campaign.characters.detail(campaignId, target.id)
    case 'game-term':
      return ROUTES.gameTerms.detail(campaignId, target.setId, target.termId)
    default: {
      const _exhaustive: never = target
      return _exhaustive
    }
  }
}
