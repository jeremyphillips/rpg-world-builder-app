import { ConfirmDialog } from '@rpg/ui'

import {
  getCharacterBuildCreateWithWarningsMessages,
  type CharacterBuildAdvisory,
  type CharacterKind,
} from '@rpg/contracts'

import { BuildAdvisoryList } from './build-advisory-list'

type CharacterBuildAdvisoryConfirmDialogProps = {
  open: boolean
  characterKind: CharacterKind
  advisories: readonly CharacterBuildAdvisory[]
  onConfirm: () => void
  onCancel: () => void
}

export function CharacterBuildAdvisoryConfirmDialog({
  open,
  characterKind,
  advisories,
  onConfirm,
  onCancel,
}: CharacterBuildAdvisoryConfirmDialogProps) {
  const copy = getCharacterBuildCreateWithWarningsMessages(characterKind)

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel()
      }}
      headline={copy.headline}
      description={copy.description}
      confirmLabel={copy.confirmLabel}
      cancelLabel={copy.cancelLabel}
      onConfirm={onConfirm}
    >
      <BuildAdvisoryList advisories={advisories} />
    </ConfirmDialog>
  )
}
