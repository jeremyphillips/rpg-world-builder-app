import type { GlobalSearchTarget } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

/** Maps a structured wire target to a dashboard href for the active campaign. */
export function resolveGlobalSearchHref(campaignId: string, target: GlobalSearchTarget): string {
  switch (target.kind) {
    case 'class':
      return ROUTES.content.classes.detail(campaignId, target.id)
    case 'spell':
      return ROUTES.content.spells.detail(campaignId, target.id)
    case 'species':
      return ROUTES.content.species.detail(campaignId, target.id)
    case 'feat':
      return ROUTES.content.feats.detail(campaignId, target.id)
    case 'equipment':
      return ROUTES.content.equipment.detail(campaignId, target.family, target.id)
    case 'skill-proficiency':
      return ROUTES.content.skillProficiencies.detail(campaignId, target.id)
    case 'organization':
      return ROUTES.content.organizations.detail(campaignId, target.id)
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
