import type {
  ContentAccessTargetType,
  ContentCampaignAccess,
  ContentCampaignAccessAvailability,
  ContentCampaignAccessUpdateResult,
  ContentUsageBlocker,
  ResolvedContentCampaignAccess,
} from '@rpg/contracts'
import { contentCampaignAccessPatchSchema, resolveContentCampaignAccess } from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { resolveContentUsageBlockers } from './content-character-usage/resolve-content-usage-blockers'
import { loadValidCampaignParticipantIds } from './campaign-access-participants.service'
import { ContentCampaignAccessModel } from './content-campaign-access.model'
import type { ContentWriteConfig, WriteEntityBase } from './content-write-config'
import { resolveContentEntityForWrite } from './content-write.service'

type StoredCampaignAccessRow = {
  targetId: string
  available: boolean
  visibilityMode: ContentCampaignAccess['visibilityMode']
  participantIds: string[]
}

function assertParticipantIdsInRoster(
  participantIds: readonly string[],
  validParticipantIds: ReadonlySet<string>,
): void {
  const unknownIds = participantIds.filter((id) => !validParticipantIds.has(id))
  if (unknownIds.length > 0) {
    throw HttpError.badRequest('One or more selected players are not in this campaign.')
  }
}

async function resolveStoredCampaignAccess(
  campaignId: string,
  stored: ContentCampaignAccess | null,
): Promise<ResolvedContentCampaignAccess> {
  const validParticipantIds = await loadValidCampaignParticipantIds(campaignId)
  return resolveContentCampaignAccess(stored, { validParticipantIds })
}

export async function loadCampaignAccessByTargetIds(
  campaignId: string,
  targetType: ContentAccessTargetType,
  targetIds: readonly string[],
): Promise<Map<string, ResolvedContentCampaignAccess>> {
  if (targetIds.length === 0) return new Map()

  const validParticipantIds = await loadValidCampaignParticipantIds(campaignId)

  const rows = await ContentCampaignAccessModel.find({
    campaignId,
    targetType,
    targetId: { $in: [...targetIds] },
  }).lean<StoredCampaignAccessRow[]>()

  const byTargetId = new Map(rows.map((row) => [row.targetId, row]))

  return new Map(
    targetIds.map((targetId) => [
      targetId,
      resolveContentCampaignAccess(byTargetId.get(targetId) ?? null, { validParticipantIds }),
    ]),
  )
}

export function attachCampaignAccessToRows<T extends { id: string }>(
  rows: readonly T[],
  accessByTargetId: ReadonlyMap<string, ResolvedContentCampaignAccess>,
): Array<T & { campaignAccess: ResolvedContentCampaignAccess }> {
  return rows.map((row) => ({
    ...row,
    campaignAccess: accessByTargetId.get(row.id) ?? resolveContentCampaignAccess(null),
  }))
}

export async function attachCampaignAccessForTargetType<T extends { id: string }>(
  campaignId: string,
  targetType: ContentAccessTargetType,
  rows: readonly T[],
): Promise<Array<T & { campaignAccess: ResolvedContentCampaignAccess }>> {
  const accessByTargetId = await loadCampaignAccessByTargetIds(
    campaignId,
    targetType,
    rows.map((row) => row.id),
  )
  return attachCampaignAccessToRows(rows, accessByTargetId)
}

async function evaluateCampaignAccessOffBlockers<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<ContentUsageBlocker[]> {
  const { entity } = await resolveContentEntityForWrite(config, campaignId, entityId)

  if (config.resolveCharacterUsageBlockers) {
    return config.resolveCharacterUsageBlockers({ campaignId, entity })
  }

  return resolveContentUsageBlockers(campaignId, config.typeName, entityId, entity.slug)
}

/** Advisory preflight for availability-off UX — always re-validated on PATCH. */
export async function getContentCampaignAccessAvailability<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<ContentCampaignAccessAvailability> {
  const blockers = await evaluateCampaignAccessOffBlockers(config, campaignId, entityId)
  if (blockers.length > 0) {
    return { status: 'blocked', blockers }
  }
  return { status: 'allowed' }
}

async function loadStoredCampaignAccess(
  campaignId: string,
  targetType: ContentAccessTargetType,
  targetId: string,
): Promise<ContentCampaignAccess | null> {
  const doc = await ContentCampaignAccessModel.findOne({
    campaignId,
    targetType,
    targetId,
  }).lean<StoredCampaignAccessRow | null>()

  if (!doc) return null

  return {
    available: doc.available,
    visibilityMode: doc.visibilityMode,
    participantIds: doc.participantIds ?? [],
  }
}

/** Authoritative campaign-access PATCH — re-checks blockers when turning availability off. */
export async function updateContentCampaignAccess<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
  input: unknown,
): Promise<ContentCampaignAccessUpdateResult> {
  const parsed = contentCampaignAccessPatchSchema.parse(input)
  const validParticipantIds = new Set(await loadValidCampaignParticipantIds(campaignId))

  if (parsed.visibilityMode === 'specific_players') {
    assertParticipantIdsInRoster(parsed.participantIds, validParticipantIds)
  }

  const targetType = config.campaignAccessTargetType ?? (config.typeName as ContentAccessTargetType)

  if (parsed.available === false) {
    const blockers = await evaluateCampaignAccessOffBlockers(config, campaignId, entityId)
    if (blockers.length > 0) {
      return { status: 'blocked', blockers }
    }

    const doc = await ContentCampaignAccessModel.findOneAndUpdate(
      { campaignId, targetType, targetId: entityId },
      {
        $set: { available: false },
        $setOnInsert: {
          visibilityMode: parsed.visibilityMode,
          participantIds: parsed.participantIds,
        },
      },
      { upsert: true, returnDocument: 'after' },
    ).lean<StoredCampaignAccessRow>()

    if (!doc) {
      throw new HttpError(404, 'not_found', 'Campaign access record not found after update.')
    }

    return {
      status: 'updated',
      campaignAccess: await resolveStoredCampaignAccess(campaignId, {
        available: doc.available,
        visibilityMode: doc.visibilityMode,
        participantIds: doc.participantIds ?? [],
      }),
    }
  }

  const doc = await ContentCampaignAccessModel.findOneAndUpdate(
    { campaignId, targetType, targetId: entityId },
    {
      $set: {
        available: parsed.available,
        visibilityMode: parsed.visibilityMode,
        participantIds: parsed.participantIds,
      },
    },
    { upsert: true, returnDocument: 'after' },
  ).lean<StoredCampaignAccessRow>()

  if (!doc) {
    throw new HttpError(404, 'not_found', 'Campaign access record not found after update.')
  }

  return {
    status: 'updated',
    campaignAccess: await resolveStoredCampaignAccess(campaignId, {
      available: doc.available,
      visibilityMode: doc.visibilityMode,
      participantIds: doc.participantIds ?? [],
    }),
  }
}

export async function deleteContentCampaignAccess(
  campaignId: string,
  targetType: ContentAccessTargetType,
  targetId: string,
): Promise<void> {
  await ContentCampaignAccessModel.deleteOne({ campaignId, targetType, targetId })
}

export async function resolveContentCampaignAccessForEntity<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<ResolvedContentCampaignAccess> {
  const targetType = config.campaignAccessTargetType ?? (config.typeName as ContentAccessTargetType)
  const stored = await loadStoredCampaignAccess(campaignId, targetType, entityId)
  return resolveStoredCampaignAccess(campaignId, stored)
}
