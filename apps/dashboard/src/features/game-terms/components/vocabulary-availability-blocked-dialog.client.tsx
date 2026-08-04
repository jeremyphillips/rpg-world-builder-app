'use client'

import type { ContentUsageBlocker } from '@rpg/contracts'

import {
  ActionBlockedDialog,
  formatActionBlockedDescription,
  formatActionBlockedTitle,
  VOCABULARY_DISABLE_ACTION,
} from '@/lib/actions'

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
  headline,
  description,
}: VocabularyAvailabilityBlockedDialogProps) {
  const usageCount =
    blockers.filter((blocker) => blocker.kind === 'usage').length || blockers.length

  return (
    <ActionBlockedDialog
      open={open}
      onOpenChange={onOpenChange}
      campaignId={campaignId}
      title={
        headline ?? formatActionBlockedTitle({ mode: 'single', action: VOCABULARY_DISABLE_ACTION })
      }
      description={
        description ??
        formatActionBlockedDescription({
          blockedCount: usageCount,
          selectedCount: usageCount,
          noun: 'entry',
          referenceNoun: 'content reference',
        })
      }
      blockers={blockers}
    />
  )
}
