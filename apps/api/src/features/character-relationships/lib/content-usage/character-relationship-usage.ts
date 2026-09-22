import type { ContentUsageBlocker } from '@rpg/contracts'
import { USAGE_BLOCKER_SOURCE_KEYS } from '@rpg/contracts'

import { findNpcById, findPcById } from '../../../character'
import { indexRecordsByContentId, type ContentUsageResolverContext } from '../../../content'
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

async function loadRelationshipUsageRecords(
  campaignId: string,
): Promise<RelationshipUsageRecord[]> {
  const docs = await CharacterRelationshipModel.find({ campaignId })
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
  ctx: Pick<ContentUsageResolverContext, 'campaignId'>,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const records = await loadRelationshipUsageRecords(ctx.campaignId)
  return indexRecordsByContentId(
    records,
    (record) => (record.organizationId ? [record.organizationId] : []),
    (record) => relationshipRecordToBlocker(record, ctx.campaignId),
  )
}

export async function indexCharacterRelationshipLocationBlockersByContentId(
  ctx: Pick<ContentUsageResolverContext, 'campaignId'>,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const records = await loadRelationshipUsageRecords(ctx.campaignId)
  return indexRecordsByContentId(
    records,
    (record) => (record.locationId ? [record.locationId] : []),
    (record) => relationshipRecordToBlocker(record, ctx.campaignId),
  )
}

export async function indexCharacterRelationshipCharacterBlockersByContentId(
  ctx: Pick<ContentUsageResolverContext, 'campaignId'>,
): Promise<Map<string, ContentUsageBlocker[]>> {
  const records = await loadRelationshipUsageRecords(ctx.campaignId)
  return indexRecordsByContentId(
    records,
    (record) =>
      [record.characterId, record.relatedCharacterId].filter(
        (value): value is string => typeof value === 'string' && value.length > 0,
      ),
    (record) => relationshipRecordToBlocker(record, ctx.campaignId),
  )
}
