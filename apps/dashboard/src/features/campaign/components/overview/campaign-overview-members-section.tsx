import type { CampaignOverviewMemberListItem } from '@rpg/contracts'
import { ActionButton, Text } from '@rpg/ui'

import { DetailCollectionPanel, EntityRowList } from '@/features/content'

import {
  CAMPAIGN_OVERVIEW_EMPTY_TEXT,
  CAMPAIGN_OVERVIEW_SECTION_LABELS,
} from '../../lib/overview/campaign-overview-labels'
import { CampaignOverviewMemberRow } from './campaign-overview-member-row'

export type CampaignOverviewMembersSectionProps = {
  members: CampaignOverviewMemberListItem[]
  campaignId?: string
  canManage?: boolean
  onInviteMember?: () => void
}

/** Campaign overview members list with derived onboarding state for players. */
export function CampaignOverviewMembersSection({
  members,
  campaignId,
  canManage = false,
  onInviteMember,
}: CampaignOverviewMembersSectionProps) {
  const hasPlayers = members.some((member) => member.role === 'pc')

  return (
    <DetailCollectionPanel
      heading={CAMPAIGN_OVERVIEW_SECTION_LABELS.members}
      headingId="campaign-overview-members-heading"
      headerAlign="center"
      bodySurface="transparent"
      action={
        canManage && onInviteMember ? (
          <ActionButton
            action="invite"
            variant="text"
            size="sm"
            iconStep="md"
            onClick={onInviteMember}
          >
            Invite member
          </ActionButton>
        ) : undefined
      }
    >
      <EntityRowList.Root
        itemCount={members.length}
        emptyLabel={CAMPAIGN_OVERVIEW_EMPTY_TEXT.members}
      >
        {members.length > 0 ? (
          <EntityRowList.Group itemCount={members.length}>
            {members.map((member) =>
              campaignId ? (
                <CampaignOverviewMemberRow
                  key={member.id}
                  campaignId={campaignId}
                  member={member}
                />
              ) : null,
            )}
          </EntityRowList.Group>
        ) : null}
        {members.length > 0 && !hasPlayers ? (
          <EntityRowList.Supplementary>
            <Text variant="muted">{CAMPAIGN_OVERVIEW_EMPTY_TEXT.members}</Text>
          </EntityRowList.Supplementary>
        ) : null}
      </EntityRowList.Root>
    </DetailCollectionPanel>
  )
}
