import type { ContentEntryUsage } from '@rpg/contracts'

import { HttpError } from '../../../../lib/http-error'
import type { ContentWriteConfig, WriteEntityBase } from '../content-write-config'
import { resolveContentEntityForWrite } from '../content-write.service'
import {
  contentUsageSurfaceKeyForWriteConfig,
  resolveContentEntryUsage,
} from './content-usage-resolvers'
import type { ContentUsageResolverContext } from './content-usage-context'

/** Informational usage for detail surfaces — viewer_display by default. */
export async function getContentEntityUsage<T extends WriteEntityBase>(
  config: ContentWriteConfig<T>,
  ctx: ContentUsageResolverContext,
  entityId: string,
): Promise<ContentEntryUsage> {
  const { entity } = await resolveContentEntityForWrite(config, ctx.campaignId, entityId)
  const surfaceKey = contentUsageSurfaceKeyForWriteConfig(config)

  try {
    return await resolveContentEntryUsage(ctx, surfaceKey, entity)
  } catch (error) {
    if (error instanceof Error && /Missing content usage registration/.test(error.message)) {
      throw new HttpError(
        404,
        'not_found',
        `Usage details are not available for content type "${surfaceKey}".`,
      )
    }
    throw error
  }
}
