import { useCallback, useMemo, useState, type ReactNode } from 'react'

import {
  ContentFormWriteGateContext,
  type ContentFormWriteGateBlock,
  type ContentFormWriteGateScope,
} from './content-form-write-gate.context'

/** Lets form sections disable strict or draft saves while a required catalog is unavailable. */
export function ContentFormWriteGateProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<Record<string, ContentFormWriteGateBlock>>({})

  const report = useCallback(
    (scope: ContentFormWriteGateScope, reporterId: string, reason: string | null) => {
      const key = `${scope}:${reporterId}`
      setBlocks((prev) => {
        if (!reason) {
          if (!(key in prev)) return prev
          const next = { ...prev }
          delete next[key]
          return next
        }
        const existing = prev[key]
        if (existing?.scope === scope && existing.reason === reason) return prev
        return { ...prev, [key]: { scope, reason } }
      })
    },
    [],
  )

  const reasonForScope = useCallback(
    (scope: ContentFormWriteGateScope) => {
      for (const block of Object.values(blocks)) {
        if (block.scope === scope) return block.reason
      }
      return null
    },
    [blocks],
  )

  const value = useMemo(() => ({ report, reasonForScope }), [report, reasonForScope])

  return (
    <ContentFormWriteGateContext.Provider value={value}>
      {children}
    </ContentFormWriteGateContext.Provider>
  )
}
