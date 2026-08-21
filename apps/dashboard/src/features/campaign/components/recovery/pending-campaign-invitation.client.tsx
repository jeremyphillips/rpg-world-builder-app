'use client'

import type { CampaignInviteInviteeListItem } from '@rpg/contracts'
import { dashboardCampaignInviteReviewPath, resolveCampaignInviteExpiryLabel } from '@rpg/contracts'
import { Text } from '@rpg/ui'
import { ChevronRight } from 'lucide-react'

import { CAMPAIGN_INVITATION_COPY } from '../../lib/onboarding/campaign-onboarding-copy'
import {
  campaignDestinationChevronClasses,
  campaignDestinationRowVariants,
} from './campaign-destination.variants'

type PendingCampaignInvitationProps = {
  invite: CampaignInviteInviteeListItem
}

export function PendingCampaignInvitation({ invite }: PendingCampaignInvitationProps) {
  const reviewHref = dashboardCampaignInviteReviewPath(invite.inviteId)
  const expiryLabel = resolveCampaignInviteExpiryLabel(invite.expiresAt)
  const body = CAMPAIGN_INVITATION_COPY.body(invite.inviterDisplayName)

  return (
    <a
      href={reviewHref}
      aria-label={`Review invitation to ${invite.campaignName}`}
      className={campaignDestinationRowVariants()}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Text>{invite.campaignName}</Text>
        <Text variant="small">{body}</Text>
        <Text variant="small">{expiryLabel}</Text>
      </div>
      <ChevronRight aria-hidden className={campaignDestinationChevronClasses} />
    </a>
  )
}
