import type {
  CharacterContentReferenceDescriptor,
  PaginatedItems,
  ReferencingCharacterSummary,
} from '@rpg/contracts'
import { characterContentReferenceMatch } from '@rpg/contracts'

import { listOpenParticipationsForCampaign } from '../../../campaign'
import {
  buildCampaignContentEligibilityMap,
  formatInviteCharacterSummary,
} from '../../../campaign-invite'
import { CharacterModel } from '../../../character'

type CharacterReferenceHit = {
  _id: unknown
  name: string
  characterType: 'pc' | 'npc'
  classes: Array<{ classId: string; level: number; subclassId?: string }>
  species: { id: string }
}

const CHARACTER_REFERENCE_PROJECTION = {
  _id: 1,
  name: 1,
  characterType: 1,
  classes: 1,
  species: 1,
} as const

const CHARACTER_REFERENCE_SORT_COLLATION = { locale: 'en', strength: 2 } as const

export async function resolveCharacterReferences(input: {
  campaignId: string
  reference: {
    descriptor: CharacterContentReferenceDescriptor
    value: string
  }
  page: number
  pageSize: number
}): Promise<PaginatedItems<ReferencingCharacterSummary>> {
  const { campaignId, reference, page, pageSize } = input
  const usageMatcher = characterContentReferenceMatch(reference.descriptor, reference.value)

  const participations = await listOpenParticipationsForCampaign(campaignId)
  const participantIds = participations.map((participation) => participation.characterId)

  if (participantIds.length === 0) {
    return { items: [], total: 0 }
  }

  const matchQuery = {
    _id: { $in: participantIds },
    ...usageMatcher,
  }

  const skip = (page - 1) * pageSize

  const [total, hits, campaignContentById] = await Promise.all([
    CharacterModel.countDocuments(matchQuery),
    CharacterModel.find(matchQuery)
      .collation(CHARACTER_REFERENCE_SORT_COLLATION)
      .sort({ name: 1, _id: 1 })
      .skip(skip)
      .limit(pageSize)
      .select(CHARACTER_REFERENCE_PROJECTION)
      .lean<CharacterReferenceHit[]>(),
    buildCampaignContentEligibilityMap(campaignId),
  ])

  return {
    items: hits.map((hit) => ({
      characterType: hit.characterType,
      character: {
        id: String(hit._id),
        name: hit.name,
        summary: formatInviteCharacterSummary(hit, campaignContentById),
      },
    })),
    total,
  }
}
