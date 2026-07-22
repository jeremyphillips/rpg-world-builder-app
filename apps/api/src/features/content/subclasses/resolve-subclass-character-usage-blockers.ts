import type { ContentUsageBlocker } from '@rpg/contracts'

import { CampaignMembershipModel } from '../../campaign/campaign-membership.model'
import { CharacterModel } from '../../character/character.model'
import type { ContentDeleteContext } from '../lib/content-write-config'

type CharacterUsageHit = {
  _id: unknown
  name: string
  characterType: 'pc' | 'npc'
  campaignId?: string | null
}

/** Characters referencing this subclass id via `classes[].subclassId`. */
export async function resolveSubclassCharacterUsageBlockers(
  ctx: ContentDeleteContext,
): Promise<ContentUsageBlocker[]> {
  const { campaignId, entity } = ctx
  const usageMatcher = { 'classes.subclassId': entity.id }

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
