'use client'

import type { ContentUsageBlocker } from '@rpg/contracts'
import { Button, Modal } from '@rpg/ui'

import { ActionBlockerReferences } from './action-blocker-references.client'
import { ACTION_CLOSE_LABEL } from './action-messages'

export type ActionBlockedDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  title: string
  description: string
  blockers: ContentUsageBlocker[]
}

/** Compact single-target blocked projection — title, description, references, Close only. */
export function ActionBlockedDialog({
  open,
  onOpenChange,
  campaignId,
  title,
  description,
  blockers,
}: ActionBlockedDialogProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header headline={title} description={description} />

        <Modal.Body>
          <ActionBlockerReferences campaignId={campaignId} blockers={blockers} />
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {ACTION_CLOSE_LABEL}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
