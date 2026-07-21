'use client'

import { useCallback, useEffect, useState } from 'react'

export const COMMIT_SUCCESS_DISPLAY_MS = 2000

export function useEquipmentAcquisitionQuantityCommit(args: {
  commit: (requestedQuantity: number) => boolean
}) {
  const { commit } = args
  const [quantity, setQuantityState] = useState(1)
  const [isPending, setIsPending] = useState(false)
  const [successQuantity, setSuccessQuantity] = useState<number | undefined>()

  useEffect(() => {
    if (successQuantity === undefined) return

    const timer = window.setTimeout(() => setSuccessQuantity(undefined), COMMIT_SUCCESS_DISPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [successQuantity])

  const setQuantity = useCallback((next: number) => {
    setSuccessQuantity(undefined)
    setQuantityState(next)
  }, [])

  const commitQuantity = useCallback(
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

  return {
    quantity,
    setQuantity,
    isPending,
    successQuantity,
    commitQuantity,
  }
}
