import type { MediaScope } from '@rpg/contracts'

import { CampaignMembershipModel } from '../../campaign'
import { HttpError } from '../../../lib/http-error'

const AUTHORING_CAMPAIGN_ROLES = new Set(['owner', 'co-owner'])

/** Stable scope key for hash deduplication within an authorized owner boundary. */
export function serializeMediaScope(scope: MediaScope): string {
  switch (scope.kind) {
    case 'campaign-content':
    case 'campaign-npc':
      return `${scope.kind}:${scope.campaignId}`
    case 'user-pc':
      return `${scope.kind}:${scope.userId}`
  }
}

/** Verify the authenticated user may create uploads for the requested scope. */
export async function assertMediaScopeAuthorized(scope: MediaScope, userId: string): Promise<void> {
  switch (scope.kind) {
    case 'campaign-content':
    case 'campaign-npc': {
      const membership = await CampaignMembershipModel.findOne({
        campaignId: scope.campaignId,
        userId,
      })
        .select('campaignRole')
        .lean<{ campaignRole?: string } | null>()

      if (!membership || !AUTHORING_CAMPAIGN_ROLES.has(membership.campaignRole ?? '')) {
        throw HttpError.forbidden('Insufficient campaign role for media uploads.')
      }
      return
    }
    case 'user-pc':
      if (scope.userId !== userId) {
        throw HttpError.forbidden('Cannot upload media for another user.')
      }
      return
  }
}
