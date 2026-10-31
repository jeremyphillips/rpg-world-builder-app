import type {
  ContentDemotionAvailability,
  ContentDemotionResult,
  ContentUsageBlocker,
} from '@rpg/contracts'
import { toApiValidationIssues } from '@rpg/contracts'
import { ZodError } from 'zod'

import { HttpError } from '../../../lib/http-error'
import type { HomebrewDoc } from './content-write-config'
import {
  contentUsageSurfaceKeyForWriteConfig,
  resolveAuthoritativeContentUsageBlockers,
} from './content-usage/content-usage-resolvers'
import type { ContentWriteConfig, WriteEntityBase } from './content-write-config'
import { resolveContentEntityForWrite, runValidateBeforeWrite } from './content-write.service'

async function evaluateContentDemotionBlockers<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<ContentUsageBlocker[]> {
  const { entity } = await resolveContentEntityForWrite(config, campaignId, entityId)

  if (entity.catalogLayer !== 'homebrew') {
    throw new HttpError(403, 'forbidden', 'System content is always published.')
  }

  const characterBlockers =
    config.characterUsageBlocksDemotion === false
      ? []
      : await resolveAuthoritativeContentUsageBlockers(
          campaignId,
          contentUsageSurfaceKeyForWriteConfig(config),
          entity,
        )

  const hookBlockers = config.resolveDemoteBlockers
    ? await config.resolveDemoteBlockers({ campaignId, entity })
    : []

  return [...characterBlockers, ...hookBlockers]
}

/** Advisory preflight for demote UX — always re-validated on POST demote. */
export async function getContentDemotionAvailability<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<ContentDemotionAvailability> {
  const blockers = await evaluateContentDemotionBlockers(config, campaignId, entityId)
  if (blockers.length > 0) {
    return { status: 'blocked', blockers }
  }
  return { status: 'allowed' }
}

function assertPublishReady<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  entity: T,
): void {
  try {
    config.storedSchema.parse({ ...entity, status: 'published' })
  } catch (err) {
    if (err instanceof ZodError) {
      throw new HttpError(
        400,
        'validation_error',
        'Content is incomplete and cannot be published.',
        {
          issues: toApiValidationIssues(err.issues),
        },
      )
    }
    throw err
  }
}

/** Promote a homebrew draft to published — no blocker evaluation. */
export async function promoteContentToPublished<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<T> {
  const { campaign, entity } = await resolveContentEntityForWrite(config, campaignId, entityId)

  if (entity.catalogLayer !== 'homebrew') {
    throw new HttpError(403, 'forbidden', 'System content is always published.')
  }

  assertPublishReady(config, entity)
  await runValidateBeforeWrite(config, {
    campaignId,
    rulesetId: campaign.rulesetId,
    mode: 'update',
    validationIntent: 'publish',
    input: {},
    normalized: {},
    existing: entity,
    effectiveBody: entity as unknown as Record<string, unknown>,
  })

  const updated = await config.homebrewModel
    .findOneAndUpdate(
      { _id: entityId, campaignId },
      { $set: { status: 'published' } },
      { returnDocument: 'after' },
    )
    .lean<HomebrewDoc>()
  if (!updated) {
    throw new HttpError(404, 'not_found', 'Homebrew record not found.')
  }

  const parsed = config.toHomebrewEntity(updated)
  return config.storedSchema.parse(parsed)
}

/** Authoritative demote — guarded by usage blockers; re-evaluates blockers before mutating. */
export async function demoteContentToDraft<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<ContentDemotionResult> {
  const blockers = await evaluateContentDemotionBlockers(config, campaignId, entityId)
  if (blockers.length > 0) {
    return { status: 'blocked', blockers }
  }

  const updated = await config.homebrewModel
    .findOneAndUpdate(
      { _id: entityId, campaignId },
      { $set: { status: 'draft' } },
      { returnDocument: 'after' },
    )
    .lean<HomebrewDoc>()
  if (!updated) {
    throw new HttpError(404, 'not_found', 'Homebrew record not found.')
  }

  return { status: 'demoted' }
}
