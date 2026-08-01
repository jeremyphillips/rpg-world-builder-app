'use client'

import type { CampaignInviteInviteeListItem } from '@rpg/contracts'
import { dashboardCampaignInviteReviewPath, resolveCampaignInviteExpiryLabel } from '@rpg/contracts'
import { Alert, buttonVariants, Text } from '@rpg/ui'
import { ChevronRight } from 'lucide-react'

import { CAMPAIGN_INVITATION_COPY } from '../lib/campaign-invitation-copy'
import {
  campaignDestinationChevronClasses,
  campaignDestinationRowVariants,
} from './campaign-destination.variants'

type PendingCampaignInvitationProps = {
  invite: CampaignInviteInviteeListItem
  variant: 'card' | 'compactList'
}

export function PendingCampaignInvitation({ invite, variant }: PendingCampaignInvitationProps) {
  const reviewHref = dashboardCampaignInviteReviewPath(invite.inviteId)
  const expiryLabel = resolveCampaignInviteExpiryLabel(invite.expiresAt)
  const body = CAMPAIGN_INVITATION_COPY.body(invite.inviterDisplayName)

  if (variant === 'card') {
    return (
      <Alert
        variant="info"
        title={CAMPAIGN_INVITATION_COPY.cardTitle}
        description={`${invite.campaignName}. ${body} ${expiryLabel}`}
        actions={
          <a href={reviewHref} className={buttonVariants({ size: 'sm' })}>
            {CAMPAIGN_INVITATION_COPY.action}
          </a>
        }
      />
    )
  }

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
