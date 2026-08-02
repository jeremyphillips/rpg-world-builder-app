import type {
  ContentDeletionAvailability,
  ContentDeletionResult,
  ContentUsageBlocker,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { deleteContentCampaignAccess } from './content-campaign-access.service'
import {
  contentUsageSurfaceKeyForWriteConfig,
  resolveAuthoritativeContentUsageBlockers,
} from './content-usage/content-usage-resolvers'
import type { ContentWriteConfig, WriteEntityBase } from './content-write-config'
import { resolveContentEntityForWrite } from './content-write.service'

async function evaluateContentDeletionBlockers<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<ContentUsageBlocker[]> {
  const { entity } = await resolveContentEntityForWrite(config, campaignId, entityId)

  if (entity.source !== 'homebrew') {
    throw new HttpError(403, 'forbidden', 'System content cannot be deleted.')
  }

  const characterBlockers = await resolveAuthoritativeContentUsageBlockers(
    campaignId,
    contentUsageSurfaceKeyForWriteConfig(config),
    entity,
  )

  const hookBlockers = config.resolveDeleteBlockers
    ? await config.resolveDeleteBlockers({ campaignId, entity })
    : []

  return [...characterBlockers, ...hookBlockers]
}

/** Advisory preflight for delete UX — always re-validated on DELETE. */
export async function getContentDeletionAvailability<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<ContentDeletionAvailability> {
  const blockers = await evaluateContentDeletionBlockers(config, campaignId, entityId)
  if (blockers.length > 0) {
    return { status: 'blocked', blockers }
  }
  return { status: 'allowed' }
}

/** Authoritative homebrew delete — guarded by usage blockers and campaign scope. */
export async function deleteContentEntity<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<ContentDeletionResult> {
  const blockers = await evaluateContentDeletionBlockers(config, campaignId, entityId)
  if (blockers.length > 0) {
    return { status: 'blocked', blockers }
  }

  const result = await config.homebrewModel.deleteOne({ _id: entityId, campaignId })
  if (result.deletedCount !== 1) {
    throw new HttpError(404, 'not_found', 'Homebrew record not found.')
  }

  const targetType = config.campaignAccessTargetType ?? config.typeName
  await deleteContentCampaignAccess(campaignId, targetType, entityId)

  return { status: 'deleted' }
}
