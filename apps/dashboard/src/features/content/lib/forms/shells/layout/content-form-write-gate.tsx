import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type ContentFormWriteGateValue = {
  reason: string | null
  setReason: (reason: string | null) => void
}

const ContentFormWriteGateContext = createContext<ContentFormWriteGateValue>({
  reason: null,
  setReason: () => undefined,
})

/** Lets a form section disable Save and Publish while a required catalog is unavailable. */
export function ContentFormWriteGateProvider({ children }: { children: ReactNode }) {
  const [reason, setReason] = useState<string | null>(null)
  const value = useMemo(() => ({ reason, setReason }), [reason])
  return (
    <ContentFormWriteGateContext.Provider value={value}>
      {children}
    </ContentFormWriteGateContext.Provider>
  )
}

export function useContentFormWriteGateReason(): string | null {
  return useContext(ContentFormWriteGateContext).reason
}

export function useReportContentFormWriteGate(reason: string | null) {
  const { setReason } = useContext(ContentFormWriteGateContext)
  useEffect(() => {
    setReason(reason)
    return () => setReason(null)
  }, [reason, setReason])
}
