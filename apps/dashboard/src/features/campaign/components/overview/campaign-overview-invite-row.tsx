import { useState } from 'react'
import type { CampaignInviteAdminListItem } from '@rpg/contracts'
import { ActionIcon, ConfirmDialog } from '@rpg/ui'
import { Link2 } from 'lucide-react'

import { EntityRowList } from '@/features/content'

import {
  useRevokeCampaignInvite,
  useShareCampaignInviteLink,
} from '../../hooks/use-campaign-invite-mutations'
import {
  CAMPAIGN_INVITE_ROW_ACTION_COPY,
  formatInvitationStatusLine,
} from '../../lib/overview/campaign-overview-labels'

export type CampaignOverviewInviteRowProps = {
  campaignId: string
  invite: CampaignInviteAdminListItem
}

export function CampaignOverviewInviteRow({ campaignId, invite }: CampaignOverviewInviteRowProps) {
  const [shareOpen, setShareOpen] = useState(false)
  const [revokeOpen, setRevokeOpen] = useState(false)
  const shareMutation = useShareCampaignInviteLink(campaignId)
  const revokeMutation = useRevokeCampaignInvite(campaignId)
  const isPending = shareMutation.isPending || revokeMutation.isPending

  async function handleShareConfirm() {
    try {
      const result = await shareMutation.mutateAsync(invite.id)
      await navigator.clipboard.writeText(result.inviteUrl)
      setShareOpen(false)
    } catch {
      // Mutation error surfaces via global handler; keep dialog open for retry.
    }
  }

  async function handleRevokeConfirm() {
    try {
      await revokeMutation.mutateAsync(invite.id)
      setRevokeOpen(false)
    } catch {
      // Mutation error surfaces via global handler.
    }
  }

  return (
    <>
      <EntityRowList.Row
        heading={invite.email}
        description={formatInvitationStatusLine(invite)}
        overflowTriggerIcon="vertical"
        menu={{
          label: `Open actions for ${invite.email}`,
          items: [
            {
              id: 'share-link',
              label: CAMPAIGN_INVITE_ROW_ACTION_COPY.shareLink,
              icon: <Link2 />,
              disabled: isPending,
              onSelect: () => setShareOpen(true),
            },
            {
              id: 'revoke',
              label: CAMPAIGN_INVITE_ROW_ACTION_COPY.revokePending,
              icon: <ActionIcon action="remove" />,
              destructive: true,
              separatorBefore: true,
              disabled: isPending,
              onSelect: () => setRevokeOpen(true),
            },
          ],
        }}
      />

      <ConfirmDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        headline={CAMPAIGN_INVITE_ROW_ACTION_COPY.shareConfirmHeadline}
        description={CAMPAIGN_INVITE_ROW_ACTION_COPY.shareConfirmDescription}
        confirmLabel={CAMPAIGN_INVITE_ROW_ACTION_COPY.shareConfirmLabel}
        onConfirm={() => {
          void handleShareConfirm()
        }}
      />

      <ConfirmDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        headline={CAMPAIGN_INVITE_ROW_ACTION_COPY.revokePendingConfirmHeadline}
        description={CAMPAIGN_INVITE_ROW_ACTION_COPY.revokePendingConfirmDescription}
        confirmLabel={CAMPAIGN_INVITE_ROW_ACTION_COPY.revokeConfirmLabel}
        confirmVariant="destructive"
        onConfirm={() => {
          void handleRevokeConfirm()
        }}
      />
    </>
  )
}
