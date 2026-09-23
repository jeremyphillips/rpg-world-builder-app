import type { ContentUsageBlocker } from '@rpg/contracts'
import { USAGE_BLOCKER_SOURCE_KEYS } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { CharacterRelationshipModel } from '../character-relationship.model'
import { indexCharacterRelationshipCharacterBlockersByContentId } from './content-usage/character-relationship-usage'

export async function countCharacterRelationshipReferences(
  campaignId: string,
  characterId: string,
): Promise<number> {
  return CharacterRelationshipModel.countDocuments({
    campaignId,
    $or: [{ characterId }, { relatedCharacterId: characterId }],
  })
}

export async function assertNoCharacterRelationshipReferences(
  campaignId: string,
  characterId: string,
): Promise<void> {
  const count = await countCharacterRelationshipReferences(campaignId, characterId)
  if (count > 0) {
    throw new HttpError(
      409,
      'conflict',
      'Character cannot be deleted while relationship edges still reference them. Remove or unlink relationships first.',
    )
  }
}

export async function resolveCampaignCharacterRelationshipBlockers(
  campaignId: string,
  characterId: string,
): Promise<ContentUsageBlocker[]> {
  const blockersByContentId = await indexCharacterRelationshipCharacterBlockersByContentId({
    campaignId,
    purpose: 'authoritative_guard',
  })

  return blockersByContentId.get(characterId) ?? []
}

export async function resolveCrossCampaignCharacterRelationshipBlockers(
  characterId: string,
): Promise<ContentUsageBlocker[]> {
  const docs = await CharacterRelationshipModel.find({
    $or: [{ characterId }, { relatedCharacterId: characterId }],
  })
    .select('campaignId characterId relatedCharacterId kind')
    .lean<
      Array<{
        campaignId: string
        characterId: string
        relatedCharacterId?: string
        kind: string
      }>
    >()

  if (docs.length === 0) {
    return []
  }

  const campaignIds = [...new Set(docs.map((doc) => doc.campaignId))]
  const blockers: ContentUsageBlocker[] = []

  for (const campaignId of campaignIds) {
    const campaignBlockers = await resolveCampaignCharacterRelationshipBlockers(
      campaignId,
      characterId,
    )
    blockers.push(...campaignBlockers)
  }

  if (blockers.length > 0) {
    return blockers
  }

  return [
    {
      kind: 'usage',
      sourceKey: USAGE_BLOCKER_SOURCE_KEYS.character_usage,
      usage: {
        kind: 'character',
        id: characterId,
        label: 'Character relationships',
        characterType: 'pc',
      },
    },
  ]
}
