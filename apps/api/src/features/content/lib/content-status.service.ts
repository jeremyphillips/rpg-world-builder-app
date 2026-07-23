import type {
  ContentDemotionAvailability,
  ContentDemotionResult,
  ContentUsageBlocker,
} from '@rpg/contracts'
import { ZodError } from 'zod'

import { HttpError } from '../../../lib/http-error'
import type { HomebrewDoc } from './content-write-config'
import { resolveContentUsageBlockers } from './content-character-usage/resolve-content-usage-blockers'
import type { ContentWriteConfig, WriteEntityBase } from './content-write-config'
import { resolveContentEntityForWrite } from './content-write.service'

async function evaluateContentDemotionBlockers<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  campaignId: string,
  entityId: string,
): Promise<ContentUsageBlocker[]> {
  const { entity } = await resolveContentEntityForWrite(config, campaignId, entityId)

  if (entity.source !== 'homebrew') {
    throw new HttpError(403, 'forbidden', 'System content is always published.')
  }

  const characterBlockers = config.resolveCharacterUsageBlockers
    ? await config.resolveCharacterUsageBlockers({ campaignId, entity })
    : await resolveContentUsageBlockers(campaignId, config.typeName, entityId, entity.slug)

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
          issues: err.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
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
  const { entity } = await resolveContentEntityForWrite(config, campaignId, entityId)

  if (entity.source !== 'homebrew') {
    throw new HttpError(403, 'forbidden', 'System content is always published.')
  }

  assertPublishReady(config, entity)

  const updated = await config.homebrewModel
    .findOneAndUpdate(
      { _id: entityId, campaignId },
      { $set: { status: 'published' } },
      { new: true },
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
    .findOneAndUpdate({ _id: entityId, campaignId }, { $set: { status: 'draft' } }, { new: true })
    .lean<HomebrewDoc>()
  if (!updated) {
    throw new HttpError(404, 'not_found', 'Homebrew record not found.')
  }

  return { status: 'demoted' }
}
