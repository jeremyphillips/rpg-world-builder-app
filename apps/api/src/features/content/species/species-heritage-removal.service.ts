import type { ContentDeletionAvailability, ContentUsageBlocker } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { listOpenParticipationsForCampaign } from '../../campaign'
import { CharacterModel } from '../../character'
import { characterHitToUsageBlocker } from '../lib/content-usage/reference-sources/characters-extract'
import { resolveContentEntityForWrite } from '../lib/content-write.service'
import { speciesWriteConfig } from './species.config'

type HeritageUsageCharacterHit = {
  _id: unknown
  name: string
  characterType: 'pc' | 'npc'
}

async function resolveHeritageOptionUsageBlockers(input: {
  campaignId: string
  speciesId: string
  heritageOptionIds: readonly string[]
}): Promise<ContentUsageBlocker[]> {
  if (input.heritageOptionIds.length === 0) {
    return []
  }

  const participations = await listOpenParticipationsForCampaign(input.campaignId)
  const characterIds = participations.map((participation) => participation.characterId)
  if (characterIds.length === 0) {
    return []
  }

  const hits = await CharacterModel.find({
    _id: { $in: characterIds },
    'species.id': input.speciesId,
    'species.heritageId': { $in: [...input.heritageOptionIds] },
  })
    .select({ _id: 1, name: 1, characterType: 1 })
    .lean<HeritageUsageCharacterHit[]>()

  return hits.map((hit) => characterHitToUsageBlocker(hit, input.campaignId))
}

/** Advisory preflight for removing a homebrew species heritage group from the form. */
export async function getSpeciesHeritageRemovalAvailability(
  campaignId: string,
  speciesId: string,
): Promise<ContentDeletionAvailability> {
  const { entity } = await resolveContentEntityForWrite(speciesWriteConfig, campaignId, speciesId)

  if (entity.source !== 'homebrew') {
    throw new HttpError(403, 'forbidden', 'System species heritage cannot be removed.')
  }

  const heritageOptionIds = entity.heritage?.options.map((option) => option.id) ?? []
  const blockers = await resolveHeritageOptionUsageBlockers({
    campaignId,
    speciesId: entity.id,
    heritageOptionIds,
  })

  if (blockers.length > 0) {
    return { status: 'blocked', blockers }
  }

  return { status: 'allowed' }
}
