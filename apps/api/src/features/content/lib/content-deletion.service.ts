import type {
  ContentDeletionAvailability,
  ContentDeletionBlocker,
  ContentDeletionResult,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'
import { resolveContentCharacterUsageBlockers } from './content-character-usage/resolve-content-character-usage-blockers'
import type { ContentWriteConfig, WriteEntityBase } from './content-write-config'
import { resolveContentEntityForWrite } from './content-write.service'

async function evaluateContentDeletion<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<ContentDeletionBlocker[]> {
  const { entity } = await resolveContentEntityForWrite(config, campaignId, entityId)

  if (entity.source !== 'homebrew') {
    throw new HttpError(403, 'forbidden', 'System content cannot be deleted.')
  }

  const characterBlockers = await resolveContentCharacterUsageBlockers(
    campaignId,
    config.typeName,
    entityId,
    entity.slug,
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
  const blockers = await evaluateContentDeletion(config, campaignId, entityId)
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
  const blockers = await evaluateContentDeletion(config, campaignId, entityId)
  if (blockers.length > 0) {
    return { status: 'blocked', blockers }
  }

  const result = await config.homebrewModel.deleteOne({ _id: entityId, campaignId })
  if (result.deletedCount !== 1) {
    throw new HttpError(404, 'not_found', 'Homebrew record not found.')
  }

  return { status: 'deleted' }
}
