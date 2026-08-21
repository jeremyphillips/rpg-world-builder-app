import type { CampaignInviteAdminListItem } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import {
  CAMPAIGN_OVERVIEW_EMPTY_TEXT,
  CAMPAIGN_OVERVIEW_SECTION_LABELS,
  formatInvitationStatusLine,
} from '../../lib/overview/campaign-overview-labels'
import { CampaignInviteRowActions } from './campaign-invite-row-actions.client'

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
    <section aria-labelledby="campaign-overview-invitations-heading" className="space-y-4">
      <Heading variant="group" as="h2" id="campaign-overview-invitations-heading">
        {CAMPAIGN_OVERVIEW_SECTION_LABELS.invitations}
      </Heading>

      {invites.length === 0 ? (
        <Text variant="muted">{CAMPAIGN_OVERVIEW_EMPTY_TEXT.invitations}</Text>
      ) : (
        <ul className="space-y-3">
          {invites.map((invite) => (
            <li
              key={invite.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="min-w-0 space-y-1">
                <Text className="font-medium">{invite.email}</Text>
                <Text variant="small" className="text-muted-foreground">
                  {formatInvitationStatusLine(invite)}
                </Text>
              </div>
              <CampaignInviteRowActions campaignId={campaignId} invite={invite} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
