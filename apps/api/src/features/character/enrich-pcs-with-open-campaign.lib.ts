import type { PcCharacter, PcCharacterListItem } from '@rpg/contracts'

import { findCampaignById, listOpenParticipationsForCharacters } from '../campaign'
import { resolveCampaignEmblemImageUrl } from '../campaign/lib/resolve-campaign-emblem-image-url.lib'

/** Attach route context and optional open-campaign label for personal character list cards. */
export async function enrichPcsWithOpenCampaign(
  characters: PcCharacter[],
): Promise<PcCharacterListItem[]> {
  if (characters.length === 0) return []

  const participations = await listOpenParticipationsForCharacters(characters.map((c) => c.id))
  const participationByCharacterId = new Map(
    participations.map((participation) => [participation.characterId, participation]),
  )

  if (participations.length === 0) {
    return characters.map((character) => ({
      ...character,
      routeContext: { kind: 'standalone' as const },
    }))
  }

  const campaignLabels = new Map<string, { name: string; emblemUrl?: string }>()

  for (const participation of participations) {
    if (campaignLabels.has(participation.campaignId)) continue
    const campaign = await findCampaignById(participation.campaignId)
    if (campaign) {
      const emblemUrl = resolveCampaignEmblemImageUrl(campaign.identity.media)
      campaignLabels.set(participation.campaignId, {
        name: campaign.identity.name,
        ...(emblemUrl ? { emblemUrl } : {}),
      })
    }
  }

  return characters.map((character) => {
    const participation = participationByCharacterId.get(character.id)
    if (!participation) {
      return {
        ...character,
        routeContext: { kind: 'standalone' as const },
      }
    }

    const campaignLabel = campaignLabels.get(participation.campaignId)

    return {
      ...character,
      routeContext: {
        kind: 'campaign' as const,
        openCampaign: { id: participation.campaignId },
        rosterStatus: participation.roster.status,
      },
      ...(campaignLabel
        ? {
            campaign: {
              id: participation.campaignId,
              name: campaignLabel.name,
              ...(campaignLabel.emblemUrl ? { emblemUrl: campaignLabel.emblemUrl } : {}),
            },
          }
        : {}),
    }
  })
}
