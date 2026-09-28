import type { ContentMedia, SystemRulesetId } from '@rpg/contracts'
import type { ClientSession } from 'mongoose'

import { HttpError } from '../../../lib/http-error'
import { areMongoTransactionsEnabled, runInTransaction } from '../../../lib/mongo-transaction'
import { deleteContentCampaignAccess } from './content-campaign-access.service'
import {
  contentUsageSurfaceKeyForWriteConfig,
  resolveAuthoritativeContentUsageBlockers,
} from './content-usage/content-usage-resolvers'
import type { ContentWriteConfig, HomebrewDoc, WriteEntityBase } from './content-write-config'
import {
  isCatalogMediaContentType,
  releaseCatalogContentMediaReferences,
  releaseCatalogContentMediaReferencesWithSession,
} from './apply-content-catalog-media.lib'
import { resolveContentEntityForWrite } from './content-write.service'
import type {
  ContentDeletionAvailability,
  ContentDeletionResult,
  ContentUsageBlocker,
} from '@rpg/contracts'

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

type HomebrewDeleteDoc = HomebrewDoc & { media?: ContentMedia }

async function releaseAttachedMediaIfNeeded<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
  doc: HomebrewDeleteDoc,
  session?: ClientSession,
): Promise<void> {
  const currentMedia = doc.media
  if (!isCatalogMediaContentType(config.typeName) || !currentMedia?.images.length) {
    return
  }

  if (session) {
    await releaseCatalogContentMediaReferencesWithSession(
      config,
      {
        campaignId,
        entityId,
        slug: doc.slug,
        rulesetId: doc.rulesetId as SystemRulesetId,
        currentMedia,
      },
      session,
    )
    return
  }

  await releaseCatalogContentMediaReferences(config, campaignId, entityId)
}

async function deleteHomebrewRecordScoped<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<void> {
  const persistDelete = async (session?: ClientSession) => {
    const doc = await config.homebrewModel
      .findOne({ _id: entityId, campaignId })
      .session(session ?? null)
      .lean<HomebrewDeleteDoc>()

    if (!doc) {
      throw new HttpError(404, 'not_found', 'Homebrew record not found.')
    }

    await releaseAttachedMediaIfNeeded(config, campaignId, entityId, doc, session)

    const result = await config.homebrewModel
      .deleteOne({ _id: entityId, campaignId })
      .session(session ?? null)
    if (result.deletedCount !== 1) {
      throw new HttpError(404, 'not_found', 'Homebrew record not found.')
    }
  }

  if (areMongoTransactionsEnabled()) {
    await runInTransaction((session) => persistDelete(session))
    return
  }

  await persistDelete()
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

  await deleteHomebrewRecordScoped(config, campaignId, entityId)

  const targetType = config.campaignAccessTargetType ?? config.typeName
  await deleteContentCampaignAccess(campaignId, targetType, entityId)

  return { status: 'deleted' }
}
