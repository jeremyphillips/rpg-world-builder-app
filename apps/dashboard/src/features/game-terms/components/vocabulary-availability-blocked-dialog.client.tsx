'use client'

import type { ContentUsageBlocker } from '@rpg/contracts'
import { Button, Heading, Modal, Text } from '@rpg/ui'

import { UsageBlockedReferenceList } from '@/lib/usage-references/usage-blocked-reference-list.client'

import {
  VOCABULARY_BULK_BLOCKED_DIALOG_DESCRIPTION,
  VOCABULARY_BULK_BLOCKED_DIALOG_HEADLINE,
  VOCABULARY_DISABLE_BLOCKED_DESCRIPTION,
  VOCABULARY_DISABLE_BLOCKED_HEADLINE,
  VOCABULARY_USAGE_REFERENCE_DISCLOSURE_LIMIT,
} from '@/features/vocabulary'

export type VocabularyAvailabilityBlockedRow = {
  rowId: string
  label: string
  blockers: ContentUsageBlocker[]
}

export type VocabularyAvailabilityBlockedDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  /** Single-entry blocked dialog. */
  blockers?: ContentUsageBlocker[]
  /** Bulk apply blocked rows — takes precedence when non-empty. */
  blockedResults?: VocabularyAvailabilityBlockedRow[]
  headline?: string
  description?: string
}

export function VocabularyAvailabilityBlockedDialog({
  open,
  onOpenChange,
  campaignId,
  blockers = [],
  blockedResults = [],
  headline,
  description,
}: VocabularyAvailabilityBlockedDialogProps) {
  const isBulk = blockedResults.length > 0
  const resolvedHeadline =
    headline ??
    (isBulk ? VOCABULARY_BULK_BLOCKED_DIALOG_HEADLINE : VOCABULARY_DISABLE_BLOCKED_HEADLINE)
  const resolvedDescription =
    description ??
    (isBulk ? VOCABULARY_BULK_BLOCKED_DIALOG_DESCRIPTION : VOCABULARY_DISABLE_BLOCKED_DESCRIPTION)

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="sm">
        <Modal.Header headline={resolvedHeadline} description={resolvedDescription} />

        <Modal.Body>
          {isBulk ? (
            <ul className="space-y-6">
              {blockedResults.map((result) => (
                <li key={result.rowId} className="space-y-2">
                  <Heading variant="group" as="h3">
                    {result.label}
                  </Heading>
                  <UsageBlockedReferenceList
                    campaignId={campaignId}
                    blockers={result.blockers}
                    disclosureLimit={VOCABULARY_USAGE_REFERENCE_DISCLOSURE_LIMIT}
                  />
                </li>
              ))}
            </ul>
          ) : blockers.length > 0 ? (
            <UsageBlockedReferenceList
              campaignId={campaignId}
              blockers={blockers}
              disclosureLimit={VOCABULARY_USAGE_REFERENCE_DISCLOSURE_LIMIT}
            />
          ) : (
            <Text variant="muted">No blockers to display.</Text>
          )}
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
