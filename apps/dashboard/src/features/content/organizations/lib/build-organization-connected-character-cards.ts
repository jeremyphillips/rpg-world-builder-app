import type { PaginatedItems, ReferencingCharacterSummary } from '@rpg/contracts'

import { buildCharacterEntitySummaryVmFromTransport } from '@/features/character'
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
      summary: buildCharacterEntitySummaryVmFromTransport({
        id: connectedCharacter.character.id,
        name: connectedCharacter.character.name,
        summary: connectedCharacter.character.summary,
        characterType: connectedCharacter.characterType,
      }),
      detailHref: resolveCampaignCharacterDetailHref(routeContext, connectedCharacter),
    })),
    total: connectedCharacters.total,
  }
}
