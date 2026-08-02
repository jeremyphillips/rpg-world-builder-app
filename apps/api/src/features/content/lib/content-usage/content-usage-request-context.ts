import type { Request } from 'express'

import { buildContentUsageResolverContext } from './content-usage-context'
import type { ContentUsageResolverContext } from './content-usage-context'

export function contentUsageContextFromRequest(
  req: Request,
  campaignId: string,
): ContentUsageResolverContext {
  const membership = req.campaignMembership

  return buildContentUsageResolverContext({
    campaignId,
    ...(membership
      ? {
          viewer: {
            userId: membership.userId,
            role: membership.campaignRole,
            controlledCharacterIds: membership.controlledCharacterIds,
          },
        }
      : {}),
  })
}
