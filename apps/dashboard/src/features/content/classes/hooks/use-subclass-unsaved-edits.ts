import { createContext, useContext, useEffect } from 'react'

type SubclassUnsavedEditsContextValue = {
  hasUnsavedEdits: boolean
  setHasUnsavedEdits: (value: boolean) => void
}

export const SubclassUnsavedEditsContext = createContext<SubclassUnsavedEditsContextValue | null>(
  null,
)

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
