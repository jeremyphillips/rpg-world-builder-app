import { useState } from 'react'
import { getAssetUrl, type CampaignOverviewMemberListItem } from '@rpg/contracts'
import { ActionIcon, ConfirmDialog, type BadgeTone } from '@rpg/ui'

import type { DetailOverflowAction } from '@/features/content'
import { DetailRowLeadingAvatar, RelationshipList } from '@/features/content'

import { useRemoveIncompleteCampaignMember } from '../../hooks/use-remove-incomplete-campaign-member'
import {
  CAMPAIGN_MEMBER_ROW_ACTION_COPY,
  CAMPAIGN_OVERVIEW_MEMBER_ONBOARDING_LABELS,
  formatCampaignRoleLabel,
  formatMemberInviteAcceptedLine,
} from '../../lib/overview/campaign-overview-labels'

export type CampaignOverviewMemberRowProps = {
  campaignId: string
  member: CampaignOverviewMemberListItem
}

function memberOnboardingStatus(
  onboardingState: CampaignOverviewMemberListItem['onboardingState'],
) {
  if (!onboardingState) return undefined

  const tone: BadgeTone = onboardingState === 'character_added' ? 'success' : 'warning'
  return [
    {
      kind: 'badge' as const,
      label: CAMPAIGN_OVERVIEW_MEMBER_ONBOARDING_LABELS[onboardingState],
      appearance: 'outline' as const,
      tone,
    },
  ]
}

function buildMemberRoleDescription(member: CampaignOverviewMemberListItem): string {
  const role = formatCampaignRoleLabel(member.role)
  if (member.inviteAcceptedAt) {
    return `${role} · ${formatMemberInviteAcceptedLine(member.inviteAcceptedAt)}`
  }
  return role
}

export function CampaignOverviewMemberRow({ campaignId, member }: CampaignOverviewMemberRowProps) {
  const [removeOpen, setRemoveOpen] = useState(false)
  const removeMutation = useRemoveIncompleteCampaignMember(campaignId)

  const overflowActions: DetailOverflowAction[] =
    member.onboardingState === 'onboarding_incomplete'
      ? [
          {
            id: 'remove-member',
            label: CAMPAIGN_MEMBER_ROW_ACTION_COPY.removeIncomplete,
            icon: <ActionIcon action="remove" />,
            destructive: true,
            disabled: removeMutation.isPending,
            onSelect: () => setRemoveOpen(true),
          },
        ]
      : []

  const menu =
    overflowActions.length > 0
      ? {
          label: `Open actions for ${member.displayName}`,
          items: overflowActions.map((action) => ({
            id: action.id,
            label: action.label,
            icon: action.icon,
            destructive: action.destructive,
            disabled: action.disabled,
            separatorBefore: action.separatorBefore,
            onSelect: action.onSelect,
          })),
        }
      : undefined

  async function handleRemoveConfirm() {
    try {
      await removeMutation.mutateAsync(member.id)
      setRemoveOpen(false)
    } catch {
      // Mutation error surfaces via global handler.
    }
  }

  return (
    <>
      <RelationshipList.Row
        title={member.displayName}
        description={buildMemberRoleDescription(member)}
        status={memberOnboardingStatus(member.onboardingState)}
        leadingMedia={
          <DetailRowLeadingAvatar
            name={member.displayName}
            src={member.avatarKey ? getAssetUrl(member.avatarKey) : undefined}
          />
        }
        menu={menu}
        overflowTriggerIcon="vertical"
      />

      {overflowActions.length > 0 ? (
        <ConfirmDialog
          open={removeOpen}
          onOpenChange={setRemoveOpen}
          headline={CAMPAIGN_MEMBER_ROW_ACTION_COPY.removeIncompleteConfirmHeadline}
          description={CAMPAIGN_MEMBER_ROW_ACTION_COPY.removeIncompleteConfirmDescription}
          confirmLabel={CAMPAIGN_MEMBER_ROW_ACTION_COPY.removeIncompleteConfirmLabel}
          confirmVariant="destructive"
          onConfirm={() => {
            void handleRemoveConfirm()
          }}
        />
      ) : null}
    </>
  )
}
