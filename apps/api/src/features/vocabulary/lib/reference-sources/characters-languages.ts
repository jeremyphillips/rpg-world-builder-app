import type { CampaignRole, ContentUsageBlocker } from '@rpg/contracts'
import { isCampaignManager } from '@rpg/contracts'

import { listOpenParticipationsForCampaign } from '../../../campaign'
import { CharacterModel } from '../../../character'

import { indexRecordsByVocabId } from './index-by-vocab-id'

export type VocabularyUsageViewerContext = {
  userId: string
  role: CampaignRole
  controlledCharacterIds: readonly string[]
}

type CharacterLanguageHit = {
  _id: unknown
  name: string
  characterType: 'pc' | 'npc'
  proficiencies?: {
    languages?: Array<{ language: string }>
  }
}

function characterToUsageBlocker(
  hit: CharacterLanguageHit,
  campaignId: string,
): ContentUsageBlocker {
  return {
    kind: 'usage',
    usage: {
      kind: 'character',
      id: String(hit._id),
      label: hit.name,
      characterType: hit.characterType,
      ...(hit.characterType === 'npc' ? { campaignId } : {}),
    },
  }
}

function extractCharacterLanguageIds(hit: CharacterLanguageHit): readonly string[] {
  return (hit.proficiencies?.languages ?? []).map((entry) => entry.language)
}

async function loadVisibleCharacterLanguageHits(
  campaignId: string,
  viewer: VocabularyUsageViewerContext,
): Promise<CharacterLanguageHit[]> {
  const participations = await listOpenParticipationsForCampaign(campaignId)
  const viewerIsManager = isCampaignManager(viewer.role)

  const visibleCharacterIds = participations
    .filter((participation) => {
      if (participation.roster.status === 'retired') return false
      if (viewerIsManager) return true
      return viewer.controlledCharacterIds.includes(participation.characterId)
    })
    .map((participation) => participation.characterId)

  if (visibleCharacterIds.length === 0) {
    return []
  }

  return CharacterModel.find({
    _id: { $in: visibleCharacterIds },
    'proficiencies.languages.0': { $exists: true },
  })
    .select({ _id: 1, name: 1, characterType: 1, proficiencies: 1 })
    .lean<CharacterLanguageHit[]>()
}

/** Viewer-scoped character language refs — returns empty index when viewer context is absent. */
export async function indexCharacterLanguageBlockersByLanguageId(input: {
  campaignId: string
  viewer?: VocabularyUsageViewerContext
}): Promise<Map<string, ContentUsageBlocker[]>> {
  if (!input.viewer) {
    return new Map()
  }

  const hits = await loadVisibleCharacterLanguageHits(input.campaignId, input.viewer)

  return indexRecordsByVocabId(hits, extractCharacterLanguageIds, (hit) =>
    characterToUsageBlocker(hit, input.campaignId),
  )
}
