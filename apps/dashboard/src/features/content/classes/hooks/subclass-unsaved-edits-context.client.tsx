'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type SubclassUnsavedEditsContextValue = {
  hasUnsavedEdits: boolean
  setHasUnsavedEdits: (value: boolean) => void
}

const SubclassUnsavedEditsContext = createContext<SubclassUnsavedEditsContextValue | null>(null)

export function SubclassUnsavedEditsProvider({ children }: { children: React.ReactNode }) {
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false)
  return (
    <SubclassUnsavedEditsContext.Provider value={{ hasUnsavedEdits, setHasUnsavedEdits }}>
      {children}
    </SubclassUnsavedEditsContext.Provider>
  )
}

export function useReportSubclassUnsavedEdits(active: boolean) {
  const ctx = useContext(SubclassUnsavedEditsContext)
  useEffect(() => {
    if (!ctx) return
    ctx.setHasUnsavedEdits(active)
    return () => ctx.setHasUnsavedEdits(false)
  }, [active, ctx])
}

export function useSubclassUnsavedEditsBlocking(): boolean {
  return useContext(SubclassUnsavedEditsContext)?.hasUnsavedEdits ?? false
}
