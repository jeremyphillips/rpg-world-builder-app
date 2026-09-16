'use client'

import * as React from 'react'

const FieldRowAnatomyContext = React.createContext(false)

/** Marks descendants as participants in a schema anatomy-grid row. */
export function FieldRowAnatomyProvider({ children }: { children: React.ReactNode }) {
  return <FieldRowAnatomyContext.Provider value={true}>{children}</FieldRowAnatomyContext.Provider>
}

/** True when rendering inside a schema `kind: 'row'` anatomy grid. */
export function useFieldRowParticipation(): boolean {
  return React.useContext(FieldRowAnatomyContext)
}
