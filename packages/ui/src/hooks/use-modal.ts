'use client'

import * as React from 'react'

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
 * `confirm()` never hangs: dismissing the modal (Esc, overlay, X) or unmounting
 * resolves the pending promise with `false`.
 */
export function useModal(): UseModalReturn {
  const [open, setOpen] = React.useState(false)
  const resolverRef = React.useRef<((value: boolean) => void) | null>(null)

  const settle = React.useCallback((result: boolean) => {
    const resolve = resolverRef.current
    if (resolve) {
      resolverRef.current = null
      resolve(result)
    }
  }, [])

  const onOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next) settle(false)
    },
    [settle],
  )

  const openModal = React.useCallback(() => {
    setOpen(true)
  }, [])

  const closeModal = React.useCallback(() => {
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

  // Never leave a hanging promise if the host unmounts while awaiting.
  React.useEffect(() => () => settle(false), [settle])

  return { open, onOpenChange, openModal, closeModal, confirm, handleConfirm, handleCancel }
}
