import { useCallback } from 'react'
import { useFormState } from 'react-hook-form'
import { useBlocker } from 'react-router-dom'
import { ConfirmDialog } from '@rpg/ui'

const DISCARD_CHANGES_HEADLINE = 'Discard changes?'
const DISCARD_CHANGES_DESCRIPTION = 'You have unsaved changes. Leaving now will lose them.'
const DISCARD_CHANGES_CONFIRM_LABEL = 'Discard'
const DISCARD_CHANGES_CANCEL_LABEL = 'Keep editing'

/** Blocks in-app navigation while the surrounding form is dirty; shows ConfirmDialog. */
export function FormUnsavedChangesGuard() {
  const { isDirty } = useFormState()
  const shouldBlock = useCallback(() => isDirty, [isDirty])
  const blocker = useBlocker(shouldBlock)

  return (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      onOpenChange={(open) => {
        if (!open) blocker.reset?.()
      }}
      headline={DISCARD_CHANGES_HEADLINE}
      description={DISCARD_CHANGES_DESCRIPTION}
      confirmLabel={DISCARD_CHANGES_CONFIRM_LABEL}
      cancelLabel={DISCARD_CHANGES_CANCEL_LABEL}
      confirmVariant="destructive"
      onConfirm={() => blocker.proceed?.()}
      onCancel={() => blocker.reset?.()}
    />
  )
}
