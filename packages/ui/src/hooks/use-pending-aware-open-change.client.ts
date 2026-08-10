'use client'

import * as React from 'react'

export type UsePendingAwareOpenChangeOptions = {
  /** When true, user-initiated dismiss (X, Escape, backdrop, Cancel → Root) is blocked. */
  pending: boolean
  /** Opt-out: allow user dismiss even while pending. */
  allowDismissWhilePending?: boolean
  onOpenChange: (open: boolean) => void
}

export type UsePendingAwareOpenChangeReturn = {
  /** Wire to Modal.Root / DrawerShell `onOpenChange` — blocks user dismiss while pending. */
  handleOpenChange: (nextOpen: boolean) => void
  /** Bypass the pending guard for successful submit or intentional parent close. */
  trustedClose: () => void
}

/**
 * Pending-aware Root `onOpenChange` for form overlays. User dismiss is blocked while
 * `pending`; `trustedClose` bypasses the guard for submit success or controlled close.
 * Compose leave-bridge / dirty discard at the shell — this hook owns pending Root behavior only.
 */
export function usePendingAwareOpenChange({
  pending,
  allowDismissWhilePending = false,
  onOpenChange,
}: UsePendingAwareOpenChangeOptions): UsePendingAwareOpenChangeReturn {
  const trustedClose = React.useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        onOpenChange(true)
        return
      }
      if (pending && !allowDismissWhilePending) return
      onOpenChange(false)
    },
    [pending, allowDismissWhilePending, onOpenChange],
  )

  return { handleOpenChange, trustedClose }
}
