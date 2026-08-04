import type { CampaignRole, ContentUsageBlocker } from '@rpg/contracts'
import { isCampaignManager, USAGE_BLOCKER_SOURCE_KEYS } from '@rpg/contracts'

import { listOpenParticipationsForCampaign } from '../../../campaign'
import { CharacterModel } from '../../../character'

import { indexRecordsByVocabId } from './index-by-vocab-id'
import type { VocabularyUsagePurpose } from '../vocabulary-usage-context'

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
    sourceKey: USAGE_BLOCKER_SOURCE_KEYS.character_usage,
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

async function loadActiveCharacterIds(campaignId: string): Promise<string[]> {
  const participations = await listOpenParticipationsForCampaign(campaignId)
  return participations
    .filter((participation) => participation.roster.status !== 'retired')
    .map((participation) => participation.characterId)
}

async function loadCharacterLanguageHits(
  characterIds: readonly string[],
): Promise<CharacterLanguageHit[]> {
  if (characterIds.length === 0) {
    return []
  }

  return CharacterModel.find({
    _id: { $in: characterIds },
    'proficiencies.languages.0': { $exists: true },
  })
    .select({ _id: 1, name: 1, characterType: 1, proficiencies: 1 })
    .lean<CharacterLanguageHit[]>()
}

async function loadAuthoritativeCharacterLanguageHits(
  campaignId: string,
): Promise<CharacterLanguageHit[]> {
  return loadCharacterLanguageHits(await loadActiveCharacterIds(campaignId))
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

  return loadCharacterLanguageHits(visibleCharacterIds)
}

async function loadCharacterLanguageHitsForPurpose(input: {
  campaignId: string
  purpose?: VocabularyUsagePurpose
  viewer?: VocabularyUsageViewerContext
}): Promise<CharacterLanguageHit[]> {
  const purpose = input.purpose ?? 'viewer_display'

  if (purpose === 'authoritative_guard') {
    return loadAuthoritativeCharacterLanguageHits(input.campaignId)
  }

  if (!input.viewer) {
    return []
  }

  return loadVisibleCharacterLanguageHits(input.campaignId, input.viewer)
}

/** Character language refs — viewer-scoped for display; campaign-wide for guards. */
export async function indexCharacterLanguageBlockersByLanguageId(input: {
  campaignId: string
  purpose?: VocabularyUsagePurpose
  viewer?: VocabularyUsageViewerContext
}): Promise<Map<string, ContentUsageBlocker[]>> {
  const hits = await loadCharacterLanguageHitsForPurpose(input)

  return indexRecordsByVocabId(hits, extractCharacterLanguageIds, (hit) =>
    characterToUsageBlocker(hit, input.campaignId),
  )
}
