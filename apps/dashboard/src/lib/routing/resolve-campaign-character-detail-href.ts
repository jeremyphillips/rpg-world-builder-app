import type { CharacterType } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { resolveCharacterDetailHref } from './resolve-character-detail-href'

/** Resolves campaign-context detail links for mixed PC/NPC character summaries. */
export function resolveCampaignCharacterDetailHref(
  routeContext: { campaignId: string },
  member: {
    characterType: CharacterType
    character: { id: string }
  },
): string {
  if (member.characterType === 'npc') {
    return ROUTES.campaign.npcs.detail(routeContext.campaignId, member.character.id)
  }

  return resolveCharacterDetailHref({
    scope: 'campaign',
    campaignId: routeContext.campaignId,
    characterId: member.character.id,
  })
}
