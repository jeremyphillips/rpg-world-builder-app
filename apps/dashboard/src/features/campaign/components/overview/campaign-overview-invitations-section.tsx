import type { CampaignInviteAdminListItem } from '@rpg/contracts'

import { DetailCollectionPanel, EntityRowList } from '@/features/content'

import {
  CAMPAIGN_OVERVIEW_EMPTY_TEXT,
  CAMPAIGN_OVERVIEW_SECTION_LABELS,
} from '../../lib/overview/campaign-overview-labels'
import { CampaignOverviewInviteRow } from './campaign-overview-invite-row'

export type CampaignOverviewInvitationsSectionProps = {
  campaignId: string
  invites: CampaignInviteAdminListItem[]
}

/** Pending campaign invitations with delivery status copy for managers. */
export function CampaignOverviewInvitationsSection({
  campaignId,
  invites,
}: CampaignOverviewInvitationsSectionProps) {
  return (
    <DetailCollectionPanel
      heading={CAMPAIGN_OVERVIEW_SECTION_LABELS.invitations}
      headingId="campaign-overview-invitations-heading"
      headerAlign="center"
      bodySurface="transparent"
    >
      <EntityRowList.Root
        itemCount={invites.length}
        emptyLabel={CAMPAIGN_OVERVIEW_EMPTY_TEXT.invitations}
      >
        {invites.length > 0 ? (
          <EntityRowList.Group itemCount={invites.length}>
            {invites.map((invite) => (
              <CampaignOverviewInviteRow key={invite.id} campaignId={campaignId} invite={invite} />
            ))}
          </EntityRowList.Group>
        ) : null}
      </EntityRowList.Root>
    </DetailCollectionPanel>
  )
}
