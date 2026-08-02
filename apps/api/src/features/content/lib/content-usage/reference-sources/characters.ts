import type {
  CampaignRole,
  CharacterContentReferenceDescriptor,
  ContentUsageBlocker,
} from '@rpg/contracts'
import { isCampaignManager } from '@rpg/contracts'
import { Types } from 'mongoose'

import { listOpenParticipationsForCampaign } from '../../../../campaign'
import { CharacterModel } from '../../../../character'

import {
  characterHitToUsageBlocker,
  extractEquipmentIdsFromCharacter,
  extractIdsFromCharacterDescriptor,
  type CharacterContentUsageHit,
} from './characters-extract'
import { indexRecordsByContentId } from './index-by-content-id'
import type { ContentUsagePurpose } from '../content-usage-context'

export type ContentUsageViewerContext = {
  userId: string
  role: CampaignRole
  controlledCharacterIds: readonly string[]
}

const CHARACTER_USAGE_BASE_PROJECTION = {
  _id: 1,
  name: 1,
  characterType: 1,
} as const

function projectionForDescriptor(
  descriptor: CharacterContentReferenceDescriptor | 'equipment',
): Record<string, 1> {
  if (descriptor === 'equipment') {
    return { ...CHARACTER_USAGE_BASE_PROJECTION, equipment: 1 }
  }

  if (descriptor.path === 'spells.spellId') {
    return { ...CHARACTER_USAGE_BASE_PROJECTION, spells: 1 }
  }

  const root = descriptor.path.split('.')[0]!
  return { ...CHARACTER_USAGE_BASE_PROJECTION, [root]: 1 }
}

async function loadCharacterHits(
  characterIds: readonly string[],
  descriptor: CharacterContentReferenceDescriptor | 'equipment',
): Promise<CharacterContentUsageHit[]> {
  if (characterIds.length === 0) {
    return []
  }

  return CharacterModel.find({ _id: { $in: characterIds } })
    .select(projectionForDescriptor(descriptor))
    .lean<CharacterContentUsageHit[]>()
}

/** Loads lean character hits for viewer-controlled PCs only. */
export async function loadControlledCharacterHits(
  controlledCharacterIds: readonly string[],
  descriptor: CharacterContentReferenceDescriptor | 'equipment',
): Promise<CharacterContentUsageHit[]> {
  const validCharacterIds = controlledCharacterIds.filter((characterId) =>
    Types.ObjectId.isValid(characterId),
  )
  return loadCharacterHits(validCharacterIds, descriptor)
}

async function loadParticipantCharacterIds(campaignId: string): Promise<string[]> {
  const participations = await listOpenParticipationsForCampaign(campaignId)
  // Preserve guard behavior: all open participations (no roster-status filter).
  return participations.map((participation) => participation.characterId)
}

async function loadVisibleCharacterIds(
  campaignId: string,
  viewer: ContentUsageViewerContext,
): Promise<string[]> {
  const participations = await listOpenParticipationsForCampaign(campaignId)
  const viewerIsManager = isCampaignManager(viewer.role)

  return participations
    .filter((participation) => {
      if (viewerIsManager) return true
      return viewer.controlledCharacterIds.includes(participation.characterId)
    })
    .map((participation) => participation.characterId)
}

async function loadCharacterHitsForPurpose(input: {
  campaignId: string
  purpose?: ContentUsagePurpose
  viewer?: ContentUsageViewerContext
  descriptor: CharacterContentReferenceDescriptor | 'equipment'
}): Promise<CharacterContentUsageHit[]> {
  const purpose = input.purpose ?? 'viewer_display'

  if (purpose === 'authoritative_guard') {
    return loadCharacterHits(await loadParticipantCharacterIds(input.campaignId), input.descriptor)
  }

  if (!input.viewer) {
    return []
  }

  return loadCharacterHits(
    await loadVisibleCharacterIds(input.campaignId, input.viewer),
    input.descriptor,
  )
}

/** Character refs for one content descriptor — purpose-aware loader over pure extract/index. */
export async function indexCharacterBlockersByContentId(input: {
  campaignId: string
  purpose?: ContentUsagePurpose
  viewer?: ContentUsageViewerContext
  descriptor: CharacterContentReferenceDescriptor
}): Promise<Map<string, ContentUsageBlocker[]>> {
  const hits = await loadCharacterHitsForPurpose(input)

  return indexRecordsByContentId(
    hits,
    (hit) => extractIdsFromCharacterDescriptor(hit, input.descriptor),
    (hit) => characterHitToUsageBlocker(hit, input.campaignId),
  )
}

/** Character equipment inventory refs — multi-bucket extract. */
export async function indexCharacterEquipmentBlockersByContentId(input: {
  campaignId: string
  purpose?: ContentUsagePurpose
  viewer?: ContentUsageViewerContext
}): Promise<Map<string, ContentUsageBlocker[]>> {
  const hits = await loadCharacterHitsForPurpose({ ...input, descriptor: 'equipment' })

  return indexRecordsByContentId(hits, extractEquipmentIdsFromCharacter, (hit) =>
    characterHitToUsageBlocker(hit, input.campaignId),
  )
}
