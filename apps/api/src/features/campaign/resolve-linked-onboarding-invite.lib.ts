import type { CampaignInvite } from '@rpg/contracts'

import { findCampaignMembershipByCampaignAndUser } from '../campaign-invite/create-or-confirm-player-membership'
import { normalizeInviteEmail } from '../campaign-invite/campaign-invite.lib'
import {
  findAcceptedInviteByCampaignAndEmail,
  findAcceptedInvitesByCampaignAndAcceptedUserId,
  findInviteById,
} from '../campaign-invite/campaign-invite.repository'
import { warnCampaignOnboardingDuplicateAcceptedInvites } from './campaign-onboarding-observability.lib'

function sortAcceptedInvitesByRecency(invites: CampaignInvite[]): CampaignInvite[] {
  return [...invites].sort((left, right) => {
    const leftAcceptedAt = left.acceptedAt ? new Date(left.acceptedAt).getTime() : 0
    const rightAcceptedAt = right.acceptedAt ? new Date(right.acceptedAt).getTime() : 0
    return rightAcceptedAt - leftAcceptedAt
  })
}

function selectNewestAcceptedInvite({
  campaignId,
  userId,
  invites,
}: {
  campaignId: string
  userId: string
  invites: CampaignInvite[]
}): CampaignInvite | null {
  if (invites.length === 0) return null

  const sorted = sortAcceptedInvitesByRecency(invites)
  if (invites.length > 1) {
    warnCampaignOnboardingDuplicateAcceptedInvites({
      campaignId,
      userId,
      selectedInviteId: sorted[0]!.id,
      acceptedInviteIds: sorted.map((invite) => invite.id),
    })
  }

  return sorted[0]!
}

async function resolveMembershipLinkedInvite({
  campaignId,
  userId,
  sourceInviteId,
}: {
  campaignId: string
  userId: string
  sourceInviteId: string
}): Promise<CampaignInvite | null> {
  const invite = await findInviteById(sourceInviteId)
  if (!invite || invite.campaignId !== campaignId || invite.acceptedByUserId !== userId) {
    return null
  }

  return invite
}

export async function resolveLinkedAcceptedInviteForOnboardingComplete({
  campaignId,
  userId,
  userEmail,
}: {
  campaignId: string
  userId: string
  userEmail: string
}): Promise<CampaignInvite | null> {
  const membership = await findCampaignMembershipByCampaignAndUser(campaignId, userId)
  const acceptedInvites = await findAcceptedInvitesByCampaignAndAcceptedUserId(campaignId, userId)

  if (membership?.sourceInviteId) {
    const membershipLinkedInvite = await resolveMembershipLinkedInvite({
      campaignId,
      userId,
      sourceInviteId: membership.sourceInviteId,
    })
    if (membershipLinkedInvite) {
      return membershipLinkedInvite
    }
  }

  const newestAcceptedInvite = selectNewestAcceptedInvite({
    campaignId,
    userId,
    invites: acceptedInvites,
  })
  if (newestAcceptedInvite) {
    return newestAcceptedInvite
  }

  const { normalizedEmail } = normalizeInviteEmail(userEmail)
  return findAcceptedInviteByCampaignAndEmail(campaignId, normalizedEmail)
}
