import { useState } from 'react'

import { SubclassUnsavedEditsContext } from './use-subclass-unsaved-edits'

export function SubclassUnsavedEditsProvider({ children }: { children: React.ReactNode }) {
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false)
  return (
    <SubclassUnsavedEditsContext.Provider value={{ hasUnsavedEdits, setHasUnsavedEdits }}>
      {children}
    </SubclassUnsavedEditsContext.Provider>
  )
}
