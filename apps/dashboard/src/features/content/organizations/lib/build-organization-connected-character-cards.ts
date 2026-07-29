import type { PaginatedItems, ReferencingCharacterSummary } from '@rpg/contracts'

import { resolveCampaignCharacterDetailHref } from '@/lib/routing/resolve-campaign-character-detail-href'

import type { OrganizationConnectedCharacterPreviewItem } from './organization-display'

export function buildOrganizationConnectedCharacterCards(
  connectedCharacters: PaginatedItems<ReferencingCharacterSummary>,
  routeContext: { campaignId: string },
): {
  previewItems: OrganizationConnectedCharacterPreviewItem[]
  total: number
} {
  return {
    previewItems: connectedCharacters.items.map((connectedCharacter) => ({
      card: {
        id: connectedCharacter.character.id,
        name: connectedCharacter.character.name,
        summary: connectedCharacter.character.summary,
      },
      detailHref: resolveCampaignCharacterDetailHref(routeContext, connectedCharacter),
    })),
    total: connectedCharacters.total,
  }
}
