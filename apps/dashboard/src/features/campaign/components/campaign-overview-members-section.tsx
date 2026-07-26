import type { CampaignOverviewMemberListItem } from '@rpg/contracts'
import { Badge, Heading, Text } from '@rpg/ui'

import {
  CAMPAIGN_OVERVIEW_EMPTY_TEXT,
  CAMPAIGN_OVERVIEW_MEMBER_ONBOARDING_LABELS,
  CAMPAIGN_OVERVIEW_SECTION_LABELS,
  formatCampaignRoleLabel,
} from '../lib/campaign-overview-labels'

export type CampaignOverviewMembersSectionProps = {
  members: CampaignOverviewMemberListItem[]
}

function memberOnboardingBadge(onboardingState: CampaignOverviewMemberListItem['onboardingState']) {
  if (!onboardingState) return null

  const tone = onboardingState === 'character_added' ? 'success' : 'warning'
  return (
    <Badge appearance="outline" tone={tone} size="sm">
      {CAMPAIGN_OVERVIEW_MEMBER_ONBOARDING_LABELS[onboardingState]}
    </Badge>
  )
}

/** Campaign overview members list with derived onboarding state for players. */
export function CampaignOverviewMembersSection({ members }: CampaignOverviewMembersSectionProps) {
  const hasPlayers = members.some((member) => member.role === 'pc')

  return (
    <section aria-labelledby="campaign-overview-members-heading" className="space-y-4">
      <Heading variant="group" as="h2" id="campaign-overview-members-heading">
        {CAMPAIGN_OVERVIEW_SECTION_LABELS.members}
      </Heading>

      {members.length === 0 ? (
        <Text variant="muted">{CAMPAIGN_OVERVIEW_EMPTY_TEXT.members}</Text>
      ) : (
        <ul className="space-y-3">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="space-y-1">
                <Text className="font-medium">{member.displayName}</Text>
                <Text variant="small" className="text-muted-foreground">
                  {formatCampaignRoleLabel(member.role)}
                </Text>
              </div>
              {memberOnboardingBadge(member.onboardingState)}
            </li>
          ))}
        </ul>
      )}

      {members.length > 0 && !hasPlayers ? (
        <Text variant="muted">{CAMPAIGN_OVERVIEW_EMPTY_TEXT.members}</Text>
      ) : null}
    </section>
  )
}
