'use client'

import * as React from 'react'

export interface UseModalOptions {
  /**
   * When `true`, attempts to close the modal (Esc, overlay, the built-in X
   * button, or `requestClose()`) are intercepted: the modal stays open and
   * `confirmingClose` flips to `true` so a `ConfirmDialog` can ask the user.
   * Wire this to dirty state (e.g. `form.formState.isDirty`).
   */
  shouldConfirmClose?: boolean
}

export interface UseModalReturn {
  /** Whether the modal is currently open. */
  open: boolean
  /** Bind to `Modal.Root`'s `onOpenChange`; resolves a pending `confirm()` with `false` on dismiss. */
  onOpenChange: (next: boolean) => void
  /** Imperatively open the modal. */
  openModal: () => void
  /** Imperatively close the modal (resolves a pending `confirm()` with `false`). */
  closeModal: () => void
  /** Open the modal and await the user's choice; resolves `true` on confirm, `false` on cancel/dismiss. */
  confirm: () => Promise<boolean>
  /** Resolve a pending `confirm()` with `true` and close. */
  handleConfirm: () => void
  /** Resolve a pending `confirm()` with `false` and close. */
  handleCancel: () => void
  /** Whether the guarded-close confirmation is showing — bind to `ConfirmDialog`'s `open`. */
  confirmingClose: boolean
  /** Attempt to close: opens the guard when `shouldConfirmClose`, otherwise closes immediately. */
  requestClose: () => void
  /** Dismiss the guard and keep the modal open. */
  cancelClose: () => void
  /** Dismiss the guard and actually close the modal. */
  confirmCloseAndExit: () => void
}

/**
 * State + promise helpers for a `Modal`. Wire `{ open, onOpenChange }` to
 * `Modal.Root`; for confirm/cancel flows, `await confirm()` and bind the footer
 * buttons to `handleConfirm` / `handleCancel`:
 *
 * ```tsx
 * const modal = useModal()
 * if (await modal.confirm()) await destroy()
 * ```
 *
 * Pass `{ shouldConfirmClose }` to guard the close (unsaved changes). The hook's
 * `onOpenChange` is the single close choke point, so it also intercepts the
 * built-in X button. Render a `ConfirmDialog` wired to `confirmingClose` /
 * `confirmCloseAndExit` / `cancelClose`.
 *
 * `confirm()` never hangs: dismissing the modal or unmounting resolves the
 * pending promise with `false`.
 */
export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const { shouldConfirmClose = false } = options
  const [open, setOpen] = React.useState(false)
  const [confirmingClose, setConfirmingClose] = React.useState(false)
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null)

  // Mirror the latest guard flag into a ref so the memoized callbacks (read in
  // event handlers) always see the current value without being re-created.
  const shouldConfirmCloseRef = React.useRef(shouldConfirmClose)
  React.useEffect(() => {
    shouldConfirmCloseRef.current = shouldConfirmClose
  }, [shouldConfirmClose])

  const settle = React.useCallback((result: boolean) => {
    const resolve = resolverRef.current
    if (resolve) {
      resolverRef.current = null
      resolve(result)
    }
  }, [])

  const requestClose = React.useCallback(() => {
    if (shouldConfirmCloseRef.current) {
      setConfirmingClose(true)
      return
    }
    setOpen(false)
    settle(false)
  }, [settle])

  const onOpenChange = React.useCallback(
    (next: boolean) => {
      if (next) {
        setOpen(true)
        return
      }
      requestClose()
    },
    [requestClose],
  )

  const openModal = React.useCallback(() => {
    setOpen(true)
  }, [])

  const closeModal = React.useCallback(() => {
    setConfirmingClose(false)
    setOpen(false)
    settle(false)
  }, [settle])

  const confirm = React.useCallback(() => {
    // Abandon any in-flight confirmation before starting a new one.
    settle(false)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [settle])

  const handleConfirm = React.useCallback(() => {
    settle(true)
    setOpen(false)
  }, [settle])

  const handleCancel = React.useCallback(() => {
    settle(false)
    setOpen(false)
  }, [settle])

  const cancelClose = React.useCallback(() => {
    setConfirmingClose(false)
  }, [])

  const confirmCloseAndExit = React.useCallback(() => {
    setConfirmingClose(false)
    setOpen(false)
    settle(false)
  }, [settle])

  // Never leave a hanging promise if the host unmounts while awaiting.
  React.useEffect(() => () => settle(false), [settle])

  return {
    open,
    onOpenChange,
    openModal,
    closeModal,
    confirm,
    handleConfirm,
    handleCancel,
    confirmingClose,
    requestClose,
    cancelClose,
    confirmCloseAndExit,
  }
}
