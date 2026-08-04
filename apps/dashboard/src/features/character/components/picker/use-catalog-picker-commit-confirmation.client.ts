'use client'

import { useCallback, useEffect, useState } from 'react'

export const CATALOG_PICKER_COMMIT_SUCCESS_MS = 1000

export const CATALOG_PICKER_ADDED_LABEL = '✓ Added'

export function useCatalogPickerCommitConfirmation(args: {
  commit: (requestedQuantity: number) => boolean
}) {
  const { commit } = args
  const [quantity, setQuantityState] = useState(1)
  const [isPending, setIsPending] = useState(false)
  const [successQuantity, setSuccessQuantity] = useState<number | undefined>()

  useEffect(() => {
    if (successQuantity === undefined) return

    const timer = window.setTimeout(
      () => setSuccessQuantity(undefined),
      CATALOG_PICKER_COMMIT_SUCCESS_MS,
    )
    return () => window.clearTimeout(timer)
  }, [successQuantity])

  const setQuantity = useCallback((next: number) => {
    setSuccessQuantity(undefined)
    setQuantityState(next)
  }, [])

  const confirm = useCallback(
    (requestedQuantity: number) => {
      if (isPending) return false

      setIsPending(true)
      try {
        const applied = commit(requestedQuantity)
        if (applied) {
          setQuantityState(1)
          setSuccessQuantity(requestedQuantity)
        }
        return applied
      } finally {
        setIsPending(false)
      }
    },
    [commit, isPending],
  )

  const clearSuccess = useCallback(() => {
    setSuccessQuantity(undefined)
  }, [])

  return {
    quantity,
    setQuantity,
    isPending,
    successQuantity,
    isSuccess: successQuantity !== undefined,
    confirm,
    clearSuccess,
  }
}
