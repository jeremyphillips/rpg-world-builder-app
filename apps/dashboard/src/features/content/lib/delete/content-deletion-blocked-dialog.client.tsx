import type { ContentUsageBlocker } from '@rpg/contracts'
import { Button, Modal } from '@rpg/ui'

import {
  formatContentDeletionBlockedDescription,
  formatContentDeletionBlockedHeadline,
} from '../content-type-labels'
import { ContentUsageBlockedList } from '../content-usage-blocked-list.client'

export interface ContentDeletionBlockedDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityName: string
  blockers: ContentUsageBlocker[]
}

export function ContentDeletionBlockedDialog({
  open,
  onOpenChange,
  entityName,
  blockers,
}: ContentDeletionBlockedDialogProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          headline={formatContentDeletionBlockedHeadline(entityName)}
          description={formatContentDeletionBlockedDescription(
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
