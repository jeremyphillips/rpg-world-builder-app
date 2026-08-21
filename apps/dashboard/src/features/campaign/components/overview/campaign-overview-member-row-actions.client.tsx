'use client'

import { useState } from 'react'
import type { CampaignOverviewMemberListItem } from '@rpg/contracts'
import { ConfirmDialog, RowActionsMenu } from '@rpg/ui'
import { Trash2 } from 'lucide-react'

import { CAMPAIGN_MEMBER_ROW_ACTION_COPY } from '../../lib/overview/campaign-overview-labels'
import { useRemoveIncompleteCampaignMember } from '../../hooks/use-remove-incomplete-campaign-member'

export type CampaignOverviewMemberRowActionsProps = {
  campaignId: string
  member: CampaignOverviewMemberListItem
}

export function CampaignOverviewMemberRowActions({
  campaignId,
  member,
}: CampaignOverviewMemberRowActionsProps) {
  const [removeOpen, setRemoveOpen] = useState(false)
  const removeMutation = useRemoveIncompleteCampaignMember(campaignId)

  if (member.onboardingState !== 'onboarding_incomplete') {
    return null
  }

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
      <RowActionsMenu
        triggerLabel={`Open actions for ${member.displayName}`}
        disabled={removeMutation.isPending}
        items={[
          {
            kind: 'action',
            id: 'remove-member',
            label: CAMPAIGN_MEMBER_ROW_ACTION_COPY.removeIncomplete,
            icon: <Trash2 />,
            destructive: true,
            onSelect: () => setRemoveOpen(true),
          },
        ]}
      />

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
    </>
  )
}
