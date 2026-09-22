import type { CharacterRelationship, ContentUsageBlocker } from '@rpg/contracts'
import { isCampaignManager, USAGE_BLOCKER_SOURCE_KEYS } from '@rpg/contracts'

import { listOpenParticipationsForCampaign } from '../../../campaign/participation/campaign-character-participation.repository'
import { findNpcById, findPcById } from '../../../character'
import {
  resolveContentUsagePurpose,
  type ContentUsageResolverContext,
} from '../../../content/lib/content-usage/content-usage-context'
import { indexRecordsByContentId } from '../../../content/lib/content-usage/reference-sources/index-by-content-id'
import { CharacterRelationshipModel } from '../../character-relationship.model'

type RelationshipUsageRecord = {
  relationshipId: string
  characterId: string
  characterName: string
  characterType: 'pc' | 'npc'
  organizationId?: string
  locationId?: string
  relatedCharacterId?: string
}

async function resolveCharacterSummary(characterId: string): Promise<{
  characterName: string
  characterType: 'pc' | 'npc'
} | null> {
  const pc = await findPcById(characterId)
  if (pc) {
    return { characterName: pc.name, characterType: 'pc' }
  }

  const npc = await findNpcById(characterId)
  if (npc) {
    return { characterName: npc.name, characterType: 'npc' }
  }

  return null
}

async function loadAllowedCharacterIds(ctx: ContentUsageResolverContext): Promise<Set<string>> {
  const purpose = resolveContentUsagePurpose(ctx)

  if (purpose === 'authoritative_guard') {
    const participations = await listOpenParticipationsForCampaign(ctx.campaignId)
    return new Set(participations.map((participation) => participation.characterId))
  }

  if (!ctx.viewer) {
    return new Set()
  }

  const participations = await listOpenParticipationsForCampaign(ctx.campaignId)
  const viewerIsManager = isCampaignManager(ctx.viewer.role)

  return new Set(
    participations
      .filter((participation) => {
        if (viewerIsManager) return true
        return ctx.viewer!.controlledCharacterIds.includes(participation.characterId)
      })
      .map((participation) => participation.characterId),
  )
}

async function loadRelationshipUsageRecords(
  ctx: ContentUsageResolverContext,
): Promise<RelationshipUsageRecord[]> {
  const allowedCharacterIds = await loadAllowedCharacterIds(ctx)
  if (allowedCharacterIds.size === 0) {
    return []
  }

  const docs = await CharacterRelationshipModel.find({ campaignId: ctx.campaignId })
    .select('_id characterId organizationId locationId relatedCharacterId')
    .lean<
      Array<{
        _id: string
        characterId: string
        organizationId?: string
        locationId?: string
        relatedCharacterId?: string
      }>
    >()

  const records: RelationshipUsageRecord[] = []
  for (const doc of docs) {
    if (!allowedCharacterIds.has(doc.characterId)) continue

    const summary = await resolveCharacterSummary(doc.characterId)
    if (!summary) continue

    records.push({
      relationshipId: doc._id,
      characterId: doc.characterId,
      characterName: summary.characterName,
      characterType: summary.characterType,
      organizationId: doc.organizationId,
      locationId: doc.locationId,
      relatedCharacterId: doc.relatedCharacterId,
    })
  }

  return records
}

function relationshipRecordToBlocker(
  record: RelationshipUsageRecord,
  campaignId: string,
): ContentUsageBlocker {
  return {
    kind: 'usage',
    sourceKey: USAGE_BLOCKER_SOURCE_KEYS.character_usage,
    usage: {
      kind: 'character',
      id: record.characterId,
      label: record.characterName,
      characterType: record.characterType,
      ...(record.characterType === 'npc' ? { campaignId } : {}),
    },
  }
}

export async function indexCharacterRelationshipOrganizationBlockersByContentId(
  ctx: ContentUsageResolverContext,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const records = await loadRelationshipUsageRecords(ctx)
  return indexRecordsByContentId(
    records,
    (record) => (record.organizationId ? [record.organizationId] : []),
    (record) => relationshipRecordToBlocker(record, ctx.campaignId),
  )
}

export async function indexCharacterRelationshipLocationBlockersByContentId(
  ctx: ContentUsageResolverContext,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const records = await loadRelationshipUsageRecords(ctx)
  return indexRecordsByContentId(
    records,
    (record) => (record.locationId ? [record.locationId] : []),
    (record) => relationshipRecordToBlocker(record, ctx.campaignId),
  )
}

export async function indexCharacterRelationshipCharacterBlockersByContentId(
  ctx: ContentUsageResolverContext,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const records = await loadRelationshipUsageRecords(ctx)
  return indexRecordsByContentId(
    records,
    (record) =>
      [record.characterId, record.relatedCharacterId].filter(
        (value): value is string => typeof value === 'string' && value.length > 0,
      ),
    (record) => relationshipRecordToBlocker(record, ctx.campaignId),
  )
}

/** Viewer-controlled PC membership relationships keyed by organization id. */
export async function indexOrganizationMembershipViewerRelationshipsByContentId(
  ctx: ContentUsageResolverContext,
): Promise<Map<string, CharacterRelationship[]>> {
  const controlledCharacterIds = ctx.viewer?.controlledCharacterIds ?? []
  if (controlledCharacterIds.length === 0) {
    return new Map()
  }

  const records = await loadRelationshipUsageRecords(ctx)
  const index = new Map<string, Map<string, CharacterRelationship>>()

  for (const record of records) {
    if (!record.organizationId) continue
    if (!controlledCharacterIds.includes(record.characterId)) continue

    const bucket = index.get(record.organizationId) ?? new Map<string, CharacterRelationship>()
    if (!bucket.has(record.characterId)) {
      bucket.set(record.characterId, {
        kind: 'member',
        characterId: record.characterId,
        characterName: record.characterName,
      })
    }
    index.set(record.organizationId, bucket)
  }

  return new Map(
    [...index.entries()].map(([organizationId, relationships]) => [
      organizationId,
      [...relationships.values()],
    ]),
  )
}
