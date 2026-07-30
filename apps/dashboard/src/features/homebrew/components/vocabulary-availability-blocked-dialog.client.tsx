'use client'

import type { ContentUsageBlocker } from '@rpg/contracts'
import { Button, Modal } from '@rpg/ui'

import { UsageBlockedReferenceList } from '@/lib/usage-references/usage-blocked-reference-list.client'

import { VOCABULARY_USAGE_REFERENCE_DISCLOSURE_LIMIT } from '../lib/vocabulary/usage-references.constants'
import {
  VOCABULARY_DISABLE_BLOCKED_DESCRIPTION,
  VOCABULARY_DISABLE_BLOCKED_HEADLINE,
} from '../lib/vocabulary/labels'

export type VocabularyAvailabilityBlockedDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  blockers: ContentUsageBlocker[]
  headline?: string
  description?: string
}

export function VocabularyAvailabilityBlockedDialog({
  open,
  onOpenChange,
  campaignId,
  blockers,
  headline = VOCABULARY_DISABLE_BLOCKED_HEADLINE,
  description = VOCABULARY_DISABLE_BLOCKED_DESCRIPTION,
}: VocabularyAvailabilityBlockedDialogProps) {
  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header headline={headline} description={description} />

        <Modal.Body>
          <UsageBlockedReferenceList
            campaignId={campaignId}
            blockers={blockers}
            disclosureLimit={VOCABULARY_USAGE_REFERENCE_DISCLOSURE_LIMIT}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  )
}
