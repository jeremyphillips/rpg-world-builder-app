import { useCallback, useRef, useState, type ReactNode } from 'react'
import { ConfirmDialog } from '@rpg/ui'

const DISCARD_CHANGES_HEADLINE = 'Discard changes?'
const DISCARD_CHANGES_DESCRIPTION = 'You have unsaved changes. Leaving now will lose them.'
const DISCARD_CHANGES_CONFIRM_LABEL = 'Discard'
const DISCARD_CHANGES_CANCEL_LABEL = 'Keep editing'

export type UnsavedChangesConfirmController = {
  isDirty: boolean
  request: (continuation: () => void, onCancel?: () => void) => void
  runTrusted: (continuation: () => void) => void
  /** Consumes a one-shot router bypass issued by `runTrusted`. */
  consumeTrustedBypass: () => boolean
  dialog: ReactNode
}

export function useUnsavedChangesConfirm({
  isDirty,
}: {
  isDirty: boolean
}): UnsavedChangesConfirmController {
  const [dialogOpen, setDialogOpen] = useState(false)
  const pendingContinuationRef = useRef<(() => void) | null>(null)
  const pendingCancelRef = useRef<(() => void) | null>(null)
  const trustedBypassRef = useRef(false)

  const request = useCallback(
    (continuation: () => void, onCancel?: () => void) => {
      if (!isDirty) {
        continuation()
        return
      }
      pendingContinuationRef.current = continuation
      pendingCancelRef.current = onCancel ?? null
      setDialogOpen(true)
    },
    [isDirty],
  )

  const runTrusted = useCallback((continuation: () => void) => {
    trustedBypassRef.current = true
    continuation()
  }, [])

  const consumeTrustedBypass = useCallback(() => {
    if (!trustedBypassRef.current) return false
    trustedBypassRef.current = false
    return true
  }, [])

  const handleConfirm = useCallback(() => {
    const continuation = pendingContinuationRef.current
    pendingContinuationRef.current = null
    pendingCancelRef.current = null
    setDialogOpen(false)
    continuation?.()
  }, [])

  const handleCancel = useCallback(() => {
    pendingContinuationRef.current = null
    pendingCancelRef.current?.()
    pendingCancelRef.current = null
    setDialogOpen(false)
  }, [])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) return
      handleCancel()
    },
    [handleCancel],
  )

  const dialog = (
    <ConfirmDialog
      open={dialogOpen}
      onOpenChange={handleOpenChange}
      headline={DISCARD_CHANGES_HEADLINE}
      description={DISCARD_CHANGES_DESCRIPTION}
      confirmLabel={DISCARD_CHANGES_CONFIRM_LABEL}
      cancelLabel={DISCARD_CHANGES_CANCEL_LABEL}
      confirmVariant="destructive"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return { isDirty, request, runTrusted, consumeTrustedBypass, dialog }
}
