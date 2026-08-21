import type { ContentUsageBlocker } from '@rpg/contracts'

import { ActionBlockedDialog } from '@/lib/actions'

import {
  formatCampaignAccessBlockedDescription,
  formatCampaignAccessBlockedHeadline,
} from './campaign-access-labels'

export interface CampaignAccessBlockedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  targetName?: string
  blockers: ContentUsageBlocker[]
}

export function CampaignAccessBlockedDialog({
  open,
  onOpenChange,
  campaignId,
  targetName,
  blockers,
}: CampaignAccessBlockedDialogProps) {
  const usageCount =
    blockers.filter((blocker) => blocker.kind === 'usage').length || blockers.length

  return (
    <ActionBlockedDialog
      open={open}
      onOpenChange={onOpenChange}
      campaignId={campaignId}
      targetName={targetName}
      title={formatCampaignAccessBlockedHeadline()}
      description={formatCampaignAccessBlockedDescription(usageCount, targetName)}
      blockers={blockers}
    />
  )
}
