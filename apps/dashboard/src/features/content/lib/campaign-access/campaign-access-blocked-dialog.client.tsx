import type { ContentUsageBlocker } from '@rpg/contracts'
import { Button, Modal } from '@rpg/ui'

import { ContentUsageBlockedList } from '../content-usage-blocked-list.client'
import {
  formatCampaignAccessBlockedDescription,
  formatCampaignAccessBlockedHeadline,
} from './campaign-access-labels'

export interface CampaignAccessBlockedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blockers: ContentUsageBlocker[]
}

export function CampaignAccessBlockedDialog({
  open,
  onOpenChange,
  blockers,
}: CampaignAccessBlockedDialogProps) {
  const usageCount =
    blockers.filter((blocker) => blocker.kind === 'usage').length || blockers.length

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          headline={formatCampaignAccessBlockedHeadline()}
          description={formatCampaignAccessBlockedDescription(usageCount)}
        />

        <ContentUsageBlockedList blockers={blockers} />

        <Modal.Footer>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
