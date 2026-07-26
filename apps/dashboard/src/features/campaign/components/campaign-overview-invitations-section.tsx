import type { CampaignInviteAdminListItem } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'

import {
  CAMPAIGN_OVERVIEW_EMPTY_TEXT,
  CAMPAIGN_OVERVIEW_SECTION_LABELS,
  formatInvitationStatusLine,
} from '../lib/campaign-overview-labels'

export type CampaignOverviewInvitationsSectionProps = {
  invites: CampaignInviteAdminListItem[]
}

/** Pending campaign invitations with delivery status copy for managers. */
export function CampaignOverviewInvitationsSection({
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
              className="space-y-1 rounded-lg border border-border bg-card px-4 py-3"
            >
              <Text className="font-medium">{invite.email}</Text>
              <Text variant="small" className="text-muted-foreground">
                {formatInvitationStatusLine(invite.deliveryStatus, invite.expiresAt)}
              </Text>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
