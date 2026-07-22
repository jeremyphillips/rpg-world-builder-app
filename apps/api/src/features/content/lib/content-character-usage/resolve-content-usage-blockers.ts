import type { ContentTypeKey, ContentUsageBlocker } from '@rpg/contracts'

import { CampaignMembershipModel } from '../../../campaign/campaign-membership.model'
import { CharacterModel } from '../../../character/character.model'
import { getContentCharacterUsageMatcher } from './content-character-usage-matchers'

type CharacterUsageHit = {
  _id: unknown
  name: string
  characterType: 'pc' | 'npc'
  campaignId?: string | null
}

/**
 * Finds characters participating in the campaign that reference homebrew content.
 * NPCs are scoped by `campaignId`; PCs come from membership `characterIds` only.
 */
export async function resolveContentUsageBlockers(
  campaignId: string,
  contentType: ContentTypeKey,
  contentId: string,
  contentSlug: string,
): Promise<ContentUsageBlocker[]> {
  const usageMatcher = getContentCharacterUsageMatcher(contentType, contentId, contentSlug)

  const memberships = await CampaignMembershipModel.find({ campaignId })
    .select('characterIds')
    .lean<{ characterIds?: string[] }[]>()

  const rawPcIds = [...new Set(memberships.flatMap((membership) => membership.characterIds ?? []))]

  let sanitizedPcIds: string[] = []
  if (rawPcIds.length > 0) {
    const existingPcs = await CharacterModel.find({
      _id: { $in: rawPcIds },
      characterType: 'pc',
    })
      .select('_id')
      .lean<{ _id: unknown }[]>()
    sanitizedPcIds = existingPcs.map((doc) => String(doc._id))
  }

  const projection = { _id: 1, name: 1, characterType: 1, campaignId: 1 } as const

  const npcHits = await CharacterModel.find({
    characterType: 'npc',
    campaignId,
    ...usageMatcher,
  })
    .select(projection)
    .lean<CharacterUsageHit[]>()

  const pcHits =
    sanitizedPcIds.length > 0
      ? await CharacterModel.find({
          _id: { $in: sanitizedPcIds },
          characterType: 'pc',
          ...usageMatcher,
        })
          .select(projection)
          .lean<CharacterUsageHit[]>()
      : []

  const byId = new Map<string, CharacterUsageHit>()
  for (const hit of [...npcHits, ...pcHits]) {
    byId.set(String(hit._id), hit)
  }

  return [...byId.values()].map((hit) => ({
    kind: 'usage' as const,
    usage: {
      kind: 'character' as const,
      id: String(hit._id),
      label: hit.name,
      characterType: hit.characterType,
      ...(hit.characterType === 'npc' && hit.campaignId ? { campaignId: hit.campaignId } : {}),
    },
  }))
}
