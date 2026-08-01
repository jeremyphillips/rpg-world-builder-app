'use client'

import type { CampaignInviteInviteeListItem } from '@rpg/contracts'
import { Eyebrow } from '@rpg/ui'

import { CAMPAIGN_INVITATION_COPY } from '../lib/campaign-invitation-copy'
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

  const variant = surface === 'home' ? 'card' : 'compactList'

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
      {variant === 'card' ? (
        <div className="space-y-3">
          {invites.map((invite) => (
            <PendingCampaignInvitation key={invite.inviteId} invite={invite} variant="card" />
          ))}
        </div>
      ) : (
        <ul className={campaignDestinationListVariants()}>
          {invites.map((invite) => (
            <li key={invite.inviteId}>
              <PendingCampaignInvitation invite={invite} variant="compactList" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
