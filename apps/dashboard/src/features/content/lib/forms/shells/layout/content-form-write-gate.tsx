import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ContentFormWriteGateScope = 'strict' | 'draft'

type Block = { scope: ContentFormWriteGateScope; reason: string }

type ContentFormWriteGateValue = {
  report: (scope: ContentFormWriteGateScope, reporterId: string, reason: string | null) => void
  reasonForScope: (scope: ContentFormWriteGateScope) => string | null
}

const ContentFormWriteGateContext = createContext<ContentFormWriteGateValue>({
  report: () => undefined,
  reasonForScope: () => null,
})

/** Lets form sections disable strict or draft saves while a required catalog is unavailable. */
export function ContentFormWriteGateProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<Record<string, Block>>({})

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

export function useContentFormWriteGateReason(
  scope: ContentFormWriteGateScope = 'strict',
): string | null {
  const { reasonForScope } = useContext(ContentFormWriteGateContext)
  return reasonForScope(scope)
}

/** Registers a scoped gate reason for the lifetime of the caller (typically one form section). */
export function useReportContentFormWriteGate(
  scope: ContentFormWriteGateScope,
  reason: string | null,
) {
  const reporterId = useId()
  const { report } = useContext(ContentFormWriteGateContext)
  useEffect(() => {
    report(scope, reporterId, reason)
    return () => report(scope, reporterId, null)
  }, [scope, reporterId, reason, report])
}
