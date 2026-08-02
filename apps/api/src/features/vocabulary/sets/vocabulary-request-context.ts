import type { Request } from 'express'

import { buildVocabularyUsageResolverContext } from '../lib/vocabulary-usage-context'
import type { VocabularyUsageResolverContext } from '../lib/vocabulary-usage-resolvers'

export function vocabularyUsageContextFromRequest(
  req: Request,
  campaignId: string,
): VocabularyUsageResolverContext {
  const membership = req.campaignMembership

  return buildVocabularyUsageResolverContext({
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
