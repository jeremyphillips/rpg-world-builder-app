import type { CampaignInviteInviteeListItem } from '@rpg/contracts'
import { DestinationList, Eyebrow } from '@rpg/ui'

import { CampaignInvitationCard } from '@/features/campaign-invite'
import { toPendingInvitePromotion } from '../../lib/recovery/campaign-recovery-promotions.lib'
import { CAMPAIGN_INVITATION_COPY } from '../../lib/onboarding/campaign-onboarding-copy'
import { campaignDestinationListProps } from './campaign-destination-list-shell'
import { PendingCampaignInvitation } from './pending-campaign-invitation'

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
        <DestinationList {...campaignDestinationListProps} density="comfortable">
          {invites.map((invite) => (
            <PendingCampaignInvitation key={invite.inviteId} invite={invite} />
          ))}
        </DestinationList>
      )}
    </section>
  )
}
