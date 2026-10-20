import type { CampaignInviteInviteeListItem } from '@rpg/contracts'
import { dashboardCampaignInviteReviewPath, resolveCampaignInviteExpiryLabel } from '@rpg/contracts'
import { DestinationItem } from '@rpg/ui'

import { CAMPAIGN_INVITATION_COPY } from '../../lib/onboarding/campaign-onboarding-copy'

type PendingCampaignInvitationProps = {
  invite: CampaignInviteInviteeListItem
}

export function PendingCampaignInvitation({ invite }: PendingCampaignInvitationProps) {
  const reviewHref = dashboardCampaignInviteReviewPath(invite.inviteId)
  const expiryLabel = resolveCampaignInviteExpiryLabel(invite.expiresAt)
  const body = CAMPAIGN_INVITATION_COPY.body(invite.inviterDisplayName)

  return (
    <DestinationItem
      link={<a href={reviewHref} aria-label={`Review invitation to ${invite.campaignName}`} />}
      title={invite.campaignName}
      description={body}
      metadata={expiryLabel}
    />
  )
}
