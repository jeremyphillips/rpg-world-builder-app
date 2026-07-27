import type { CampaignInvite } from '@rpg/contracts'

import { normalizeInviteEmail } from '../campaign-invite/campaign-invite.lib'
import {
  findAcceptedInviteByCampaignAndEmail,
  findAcceptedInvitesByCampaignAndAcceptedUserId,
} from '../campaign-invite/campaign-invite.repository'

function selectLinkedAcceptedInvite(invites: CampaignInvite[]): CampaignInvite | null {
  if (invites.length === 0) return null
  if (invites.length === 1) return invites[0]!

  const sorted = [...invites].sort((left, right) => {
    const leftAcceptedAt = left.acceptedAt ? new Date(left.acceptedAt).getTime() : 0
    const rightAcceptedAt = right.acceptedAt ? new Date(right.acceptedAt).getTime() : 0
    return rightAcceptedAt - leftAcceptedAt
  })

  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[campaign-onboarding] Multiple accepted invites for campaign ${sorted[0]!.campaignId}; ` +
        `using invite ${sorted[0]!.id} for completion audit.`,
    )
  }

  return sorted[0]!
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
  const acceptedInvites = await findAcceptedInvitesByCampaignAndAcceptedUserId(campaignId, userId)
  const linkedInvite = selectLinkedAcceptedInvite(acceptedInvites)
  if (linkedInvite) return linkedInvite

  const { normalizedEmail } = normalizeInviteEmail(userEmail)
  return findAcceptedInviteByCampaignAndEmail(campaignId, normalizedEmail)
}
