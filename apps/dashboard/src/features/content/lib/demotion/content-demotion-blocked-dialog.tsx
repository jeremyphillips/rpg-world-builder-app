import type { ContentUsageBlocker } from '@rpg/contracts'
import { Button, Modal } from '@rpg/ui'

import {
  formatContentDemotionBlockedDescription,
  formatContentDemotionBlockedHeadline,
} from '../content-type-labels'
import { ContentUsageBlockedList } from '../delete/content-usage-blocked-list'

export interface ContentDemotionBlockedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blockers: ContentUsageBlocker[]
}

export function ContentDemotionBlockedDialog({
  open,
  onOpenChange,
  blockers,
}: ContentDemotionBlockedDialogProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          headline={formatContentDemotionBlockedHeadline()}
          description={formatContentDemotionBlockedDescription(
            blockers.filter((blocker) => blocker.kind === 'usage').length || blockers.length,
          )}
        />

        <ContentUsageBlockedList blockers={blockers} />

        <Modal.Footer>
          <Modal.FooterActions>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </Modal.FooterActions>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
