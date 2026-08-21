import { useCallback, useEffect, useState } from 'react'

export const EQUIPMENT_ACQUISITION_COMMIT_SUCCESS_MS = 1000

export const EQUIPMENT_ACQUISITION_ADDED_LABEL = '✓ Added'

export function useEquipmentAcquisitionCommitConfirmation(args: {
  commit: (requestedQuantity: number) => boolean
}) {
  const { commit } = args
  const [quantity, setQuantityState] = useState(1)
  const [isPending, setIsPending] = useState(false)
  const [successQuantity, setSuccessQuantity] = useState<number | undefined>()
  const [commitFailed, setCommitFailed] = useState(false)

  useEffect(() => {
    if (successQuantity === undefined) return

    const timer = window.setTimeout(
      () => setSuccessQuantity(undefined),
      EQUIPMENT_ACQUISITION_COMMIT_SUCCESS_MS,
    )
    return () => window.clearTimeout(timer)
  }, [successQuantity])

  const setQuantity = useCallback((next: number) => {
    setSuccessQuantity(undefined)
    setCommitFailed(false)
    setQuantityState(next)
  }, [])

  const confirm = useCallback(
    (requestedQuantity: number) => {
      if (isPending) return false

      setIsPending(true)
      setCommitFailed(false)
      try {
        const applied = commit(requestedQuantity)
        if (applied) {
          setQuantityState(1)
          setSuccessQuantity(requestedQuantity)
        } else {
          setCommitFailed(true)
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
    setCommitFailed(false)
  }, [])

  return {
    quantity,
    setQuantity,
    isPending,
    successQuantity,
    isSuccess: successQuantity !== undefined,
    commitFailed,
    confirm,
    clearSuccess,
  }
}
