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
  targetName?: string
  blockers: ContentUsageBlocker[]
  headline?: string
  description?: string
}

export function VocabularyAvailabilityBlockedDialog({
  open,
  onOpenChange,
  campaignId,
  targetName,
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
      targetName={targetName}
      title={
        headline ?? formatActionBlockedTitle({ mode: 'single', action: VOCABULARY_DISABLE_ACTION })
      }
      description={
        description ??
        formatActionBlockedDescription({
          mode: 'single',
          action: VOCABULARY_DISABLE_ACTION,
          blockedCount: usageCount,
          selectedCount: 1,
          noun: 'entry',
          referenceNoun: 'content reference',
          referenceCount: usageCount,
          targetName,
        })
      }
      blockers={blockers}
    />
  )
}
