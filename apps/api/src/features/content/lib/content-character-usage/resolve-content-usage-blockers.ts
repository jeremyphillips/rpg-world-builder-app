import type { ApiContentTypeKey, ContentUsageBlocker } from '@rpg/contracts'

import { listOpenParticipationsForCampaign } from '../../../campaign'
import { CharacterModel } from '../../../character'
import { getContentCharacterUsageMatcher } from './content-character-usage-matchers'

type CharacterUsageHit = {
  _id: unknown
  name: string
  characterType: 'pc' | 'npc'
}

/**
 * Finds characters participating in the campaign that reference homebrew content.
 * Both PCs and NPCs are resolved via open campaign participations.
 */
export async function resolveContentUsageBlockers(
  campaignId: string,
  contentType: ApiContentTypeKey,
  contentId: string,
  contentSlug: string,
): Promise<ContentUsageBlocker[]> {
  const usageMatcher = getContentCharacterUsageMatcher(contentType, contentId, contentSlug)

  const participations = await listOpenParticipationsForCampaign(campaignId)
  const participantIds = participations.map((participation) => participation.characterId)

  if (participantIds.length === 0) {
    return []
  }

  const projection = { _id: 1, name: 1, characterType: 1 } as const

  const hits = await CharacterModel.find({
    _id: { $in: participantIds },
    ...usageMatcher,
  })
    .select(projection)
    .lean<CharacterUsageHit[]>()

  const byId = new Map<string, CharacterUsageHit>()
  for (const hit of hits) {
    byId.set(String(hit._id), hit)
  }

  return [...byId.values()].map((hit) => ({
    kind: 'usage' as const,
    usage: {
      kind: 'character' as const,
      id: String(hit._id),
      label: hit.name,
      characterType: hit.characterType,
      ...(hit.characterType === 'npc' ? { campaignId } : {}),
    },
  }))
}
