'use client'

import type { CampaignInviteInviteeListItem } from '@rpg/contracts'
import { Eyebrow } from '@rpg/ui'

import { CampaignInvitationCard } from '@/features/campaign-invite'
import { toPendingInvitePromotion } from '../lib/campaign-recovery-promotions.lib'
import { CAMPAIGN_INVITATION_COPY } from '../lib/campaign-onboarding-copy'
import { campaignDestinationListVariants } from './campaign-destination.variants'
import { PendingCampaignInvitation } from './pending-campaign-invitation.client'

type PendingCampaignInvitationsSectionProps = {
  invites: readonly CampaignInviteInviteeListItem[]
  surface: 'home' | 'index'
}

export function PendingCampaignInvitationsSection({
  invites,
  surface,
}: PendingCampaignInvitationsSectionProps) {
  if (invites.length === 0) return null

  const heading =
    surface === 'home'
      ? invites.length > 1
        ? CAMPAIGN_INVITATION_COPY.homeSectionHeading(invites.length)
        : null
      : CAMPAIGN_INVITATION_COPY.indexSectionHeading

  return (
    <section className="space-y-2">
      {heading ? (
        <Eyebrow
          as={surface === 'home' ? 'h2' : 'h3'}
          size="sm"
          tone={surface === 'home' ? 'foreground' : 'muted'}
        >
          {heading}
        </Eyebrow>
      ) : null}
      {surface === 'home' ? (
        <div className="space-y-3">
          {invites.map((invite) => (
            <CampaignInvitationCard
              key={invite.inviteId}
              promotion={toPendingInvitePromotion(invite)}
            />
          ))}
        </div>
      ) : (
        <ul className={campaignDestinationListVariants()}>
          {invites.map((invite) => (
            <li key={invite.inviteId}>
              <PendingCampaignInvitation invite={invite} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
