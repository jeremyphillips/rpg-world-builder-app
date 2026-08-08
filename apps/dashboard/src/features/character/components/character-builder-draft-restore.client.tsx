'use client'

import { ConfirmDialog } from '@rpg/ui'

import type { CharacterBuildContext } from '@rpg/contracts'

import { useCharacterBuilderStore } from '../hooks/use-character-builder-store'
import { getBuilderChromeCopyForContext } from '../lib/builder/builder-chrome-copy'

type CharacterBuilderDraftRestoreProps = {
  context: CharacterBuildContext
}

export function CharacterBuilderDraftRestore({ context }: CharacterBuilderDraftRestoreProps) {
  const chrome = getBuilderChromeCopyForContext(context)
  const hasPendingRestore = useCharacterBuilderStore(context, (state) => state.hasPendingRestore)
  const continuePreviousDraft = useCharacterBuilderStore(
    context,
    (state) => state.continuePreviousDraft,
  )
  const startOver = useCharacterBuilderStore(context, (state) => state.startOver)

  return (
    <ConfirmDialog
      open={hasPendingRestore}
      onOpenChange={() => {}}
      headline={chrome.draftRestoreHeadline}
      description={chrome.draftRestoreDescription}
      confirmLabel={chrome.draftRestoreConfirmLabel}
      cancelLabel={chrome.draftRestoreCancelLabel}
      onConfirm={continuePreviousDraft}
      onCancel={startOver}
      focusConfirmOnOpen
    />
  )
}
