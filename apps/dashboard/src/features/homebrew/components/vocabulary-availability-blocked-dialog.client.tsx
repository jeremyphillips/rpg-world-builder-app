'use client'

import type { ContentUsageBlocker } from '@rpg/contracts'
import { Button, Modal } from '@rpg/ui'

import { UsageBlockedList } from '@/lib/usage-blocked/usage-blocked-list.client'

import {
  VOCABULARY_DISABLE_BLOCKED_DESCRIPTION,
  VOCABULARY_DISABLE_BLOCKED_HEADLINE,
} from '../lib/vocabulary/labels'

export type VocabularyAvailabilityBlockedDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  blockers: ContentUsageBlocker[]
}

export function VocabularyAvailabilityBlockedDialog({
  open,
  onOpenChange,
  campaignId,
  blockers,
}: VocabularyAvailabilityBlockedDialogProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header
          headline={VOCABULARY_DISABLE_BLOCKED_HEADLINE}
          description={VOCABULARY_DISABLE_BLOCKED_DESCRIPTION}
        />

        <UsageBlockedList blockers={blockers} campaignId={campaignId} />

        <Modal.Footer>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
