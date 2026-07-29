import type { PcCharacter, PcCharacterListItem } from '@rpg/contracts'

import { findCampaignById, listOpenParticipationsForCharacters } from '../campaign'

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

  const campaignNames = new Map<string, string>()

  for (const participation of participations) {
    if (campaignNames.has(participation.campaignId)) continue
    const campaign = await findCampaignById(participation.campaignId)
    if (campaign) {
      campaignNames.set(participation.campaignId, campaign.identity.name)
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

    const campaignName = campaignNames.get(participation.campaignId)

    return {
      ...character,
      routeContext: {
        kind: 'campaign' as const,
        openCampaign: { id: participation.campaignId },
        rosterStatus: participation.roster.status,
      },
      ...(campaignName
        ? {
            campaign: {
              id: participation.campaignId,
              name: campaignName,
            },
          }
        : {}),
    }
  })
}
