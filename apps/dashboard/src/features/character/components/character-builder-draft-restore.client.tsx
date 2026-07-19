'use client'

import { ConfirmDialog } from '@rpg/ui'

import type { CharacterBuildContext } from '@rpg/contracts'

import { useCharacterBuilderStore } from '../hooks/use-character-builder-store'

type CharacterBuilderDraftRestoreProps = {
  context: CharacterBuildContext
}

export function CharacterBuilderDraftRestore({ context }: CharacterBuilderDraftRestoreProps) {
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
      headline="Continue your character?"
      description="A previous draft for this ruleset was saved in this browser session. Continue where you left off or start a new character."
      confirmLabel="Continue previous draft"
      cancelLabel="Start over"
      onConfirm={continuePreviousDraft}
      onCancel={startOver}
    />
  )
}
