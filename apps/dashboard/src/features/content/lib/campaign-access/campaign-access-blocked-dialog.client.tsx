import type { ContentUsageBlocker } from '@rpg/contracts'

import { ActionBlockedDialog } from '@/lib/actions/action-blocked-dialog.client'

import {
  formatCampaignAccessBlockedDescription,
  formatCampaignAccessBlockedHeadline,
} from './campaign-access-labels'

export interface CampaignAccessBlockedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  blockers: ContentUsageBlocker[]
}

export function CampaignAccessBlockedDialog({
  open,
  onOpenChange,
  campaignId,
  blockers,
}: CampaignAccessBlockedDialogProps) {
  const usageCount =
    blockers.filter((blocker) => blocker.kind === 'usage').length || blockers.length

  return (
    <ActionBlockedDialog
      open={open}
      onOpenChange={onOpenChange}
      campaignId={campaignId}
      title={formatCampaignAccessBlockedHeadline()}
      description={formatCampaignAccessBlockedDescription(usageCount)}
      blockers={blockers}
    />
  )
}
