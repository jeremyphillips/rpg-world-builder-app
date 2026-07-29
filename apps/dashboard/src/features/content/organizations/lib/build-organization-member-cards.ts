import type { PaginatedItems, ReferencingCharacterSummary } from '@rpg/contracts'

import type { CharacterListCardPreviewItem } from '@/features/character/components/character-list-card.lib'
import { resolveCampaignCharacterDetailHref } from '@/lib/routing/resolve-campaign-character-detail-href'

export function buildOrganizationMemberCards(
  members: PaginatedItems<ReferencingCharacterSummary>,
  routeContext: { campaignId: string },
): {
  previewItems: CharacterListCardPreviewItem[]
  total: number
} {
  return {
    previewItems: members.items.map((member) => ({
      card: {
        id: member.character.id,
        name: member.character.name,
        summary: member.character.summary,
      },
      detailHref: resolveCampaignCharacterDetailHref(routeContext, member),
    })),
    total: members.total,
  }
}
