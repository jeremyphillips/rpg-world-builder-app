import type { PcCharacter, PcCharacterListItem } from '@rpg/contracts'

import { findCampaignById } from '../campaign/find-campaign-by-id'
import { listOpenParticipationsForCharacters } from '../campaign/participation/campaign-character-participation.repository'

/** Attach optional open-campaign metadata for standalone character list cards. */
export async function enrichPcsWithOpenCampaign(
  characters: PcCharacter[],
): Promise<PcCharacterListItem[]> {
  if (characters.length === 0) return []

  const participations = await listOpenParticipationsForCharacters(characters.map((c) => c.id))
  if (participations.length === 0) return characters

  const participationByCharacterId = new Map(
    participations.map((participation) => [participation.characterId, participation]),
  )
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
    if (!participation) return character

    const campaignName = campaignNames.get(participation.campaignId)
    if (!campaignName) return character

    return {
      ...character,
      campaign: {
        id: participation.campaignId,
        name: campaignName,
      },
    }
  })
}
