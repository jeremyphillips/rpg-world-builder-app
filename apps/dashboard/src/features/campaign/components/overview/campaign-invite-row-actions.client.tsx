'use client'

import { useState } from 'react'
import type { CampaignInviteAdminListItem } from '@rpg/contracts'
import { ConfirmDialog, RowActionsMenu } from '@rpg/ui'
import { Link2, Trash2 } from 'lucide-react'

import { CAMPAIGN_INVITE_ROW_ACTION_COPY } from '../../lib/overview/campaign-overview-labels'
import {
  useRevokeCampaignInvite,
  useShareCampaignInviteLink,
} from '../../hooks/use-campaign-invite-mutations'

export type CampaignInviteRowActionsProps = {
  campaignId: string
  invite: CampaignInviteAdminListItem
}

export function CampaignInviteRowActions({ campaignId, invite }: CampaignInviteRowActionsProps) {
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
      <RowActionsMenu
        triggerLabel={`Open actions for ${invite.email}`}
        disabled={isPending}
        items={[
          {
            kind: 'action',
            id: 'share-link',
            label: CAMPAIGN_INVITE_ROW_ACTION_COPY.shareLink,
            icon: <Link2 />,
            onSelect: () => setShareOpen(true),
          },
          {
            kind: 'action',
            id: 'revoke',
            label: CAMPAIGN_INVITE_ROW_ACTION_COPY.revokePending,
            icon: <Trash2 />,
            destructive: true,
            separatorBefore: true,
            onSelect: () => setRevokeOpen(true),
          },
        ]}
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
