import type { MediaScope } from '@rpg/contracts'

import { CampaignMembershipModel } from '../../campaign'
import { HttpError } from '../../../lib/http-error'

const AUTHORING_CAMPAIGN_ROLES = new Set(['owner', 'co-owner'])

export type MediaScopeAccess = 'read' | 'write'

/** Stable scope key for hash deduplication within an authorized owner boundary. */
export function serializeMediaScope(scope: MediaScope): string {
  switch (scope.kind) {
    case 'campaign-content':
    case 'campaign-identity':
    case 'campaign-npc':
      return `${scope.kind}:${scope.campaignId}`
    case 'user-pc':
      return `${scope.kind}:${scope.userId}`
  }
}

function isCampaignMediaAuthorized(
  membership: { campaignRole?: string } | null,
  access: MediaScopeAccess,
): boolean {
  if (!membership) return false
  if (access === 'read') return true
  return AUTHORING_CAMPAIGN_ROLES.has(membership.campaignRole ?? '')
}

function campaignMediaForbiddenMessage(access: MediaScopeAccess): string {
  return access === 'read'
    ? 'Campaign membership required to view media.'
    : 'Insufficient campaign role for media uploads.'
}

async function assertCampaignMediaScopeAuthorized(
  campaignId: string,
  userId: string,
  access: MediaScopeAccess,
): Promise<void> {
  const membership = await CampaignMembershipModel.findOne({ campaignId, userId })
    .select('campaignRole')
    .lean<{ campaignRole?: string } | null>()

  if (!isCampaignMediaAuthorized(membership, access)) {
    throw HttpError.forbidden(campaignMediaForbiddenMessage(access))
  }
}

function assertUserPcMediaScopeAuthorized(scopeUserId: string, userId: string): void {
  if (scopeUserId !== userId) {
    throw HttpError.forbidden('Cannot upload media for another user.')
  }
}

/** Verify the authenticated user may read or write media for the requested scope. */
export async function assertMediaScopeAuthorized(
  scope: MediaScope,
  userId: string,
  access: MediaScopeAccess = 'write',
): Promise<void> {
  switch (scope.kind) {
    case 'campaign-content':
    case 'campaign-identity':
    case 'campaign-npc':
      await assertCampaignMediaScopeAuthorized(scope.campaignId, userId, access)
      return
    case 'user-pc':
      assertUserPcMediaScopeAuthorized(scope.userId, userId)
      return
  }
}
