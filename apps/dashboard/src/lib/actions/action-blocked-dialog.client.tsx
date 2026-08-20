'use client'

import type { ContentUsageBlocker } from '@rpg/contracts'
import { Button, Modal } from '@rpg/ui'

import { ActionBlockerReferences } from './action-blocker-references.client'
import { ACTION_DIALOG_MODAL_SIZE } from './action-dialog-shell.lib'
import { ACTION_CLOSE_LABEL } from './action-messages'

export type ActionBlockedDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  /** Retained for domain caller parity; blocked context lives in the modal header. */
  targetName?: string
  title: string
  description: string
  blockers: ContentUsageBlocker[]
}

/** Compact single-target blocked projection — header copy plus flat reference list only. */
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
      <Modal.Content size={ACTION_DIALOG_MODAL_SIZE}>
        <Modal.Header headline={title} description={description} />

        <Modal.Body>
          <ActionBlockerReferences campaignId={campaignId} blockers={blockers} variant="flat" />
        </Modal.Body>

        <Modal.Footer>
          <Modal.FooterActions>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {ACTION_CLOSE_LABEL}
            </Button>
          </Modal.FooterActions>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
