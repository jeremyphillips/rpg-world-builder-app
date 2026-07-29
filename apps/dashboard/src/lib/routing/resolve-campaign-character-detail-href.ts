import type { ReferencingCharacterSummary } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { resolveCharacterDetailHref } from './resolve-character-detail-href'

/** Resolves campaign-context detail links for mixed PC/NPC character summaries. */
export function resolveCampaignCharacterDetailHref(
  routeContext: { campaignId: string },
  member: Pick<ReferencingCharacterSummary, 'characterType' | 'character'>,
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
