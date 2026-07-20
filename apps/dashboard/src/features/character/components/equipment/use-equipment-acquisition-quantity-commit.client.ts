'use client'

import { useCallback, useState } from 'react'

import { formatAcquisitionSuccessMessage } from './equipment-acquisition-panel.lib'

export function useEquipmentAcquisitionQuantityCommit(args: {
  commit: (requestedQuantity: number) => boolean
}) {
  const { commit } = args
  const [quantity, setQuantityState] = useState(1)
  const [isPending, setIsPending] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | undefined>()

  const setQuantity = useCallback((next: number) => {
    setSuccessMessage(undefined)
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
          setSuccessMessage(formatAcquisitionSuccessMessage(requestedQuantity))
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
    successMessage,
    commitQuantity,
  }
}
