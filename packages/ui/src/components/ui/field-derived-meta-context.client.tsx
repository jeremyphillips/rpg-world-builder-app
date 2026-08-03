'use client'

import * as React from 'react'

import type { FieldDerivedMeta } from '../../form/field-config'

export interface FieldDerivedMetaContextValue {
  meta?: FieldDerivedMeta
  reserveSpace: boolean
}

const FieldDerivedMetaContext = React.createContext<FieldDerivedMetaContextValue>({
  reserveSpace: false,
})

export function FieldDerivedMetaProvider({
  meta,
  reserveSpace = false,
  children,
}: {
  meta?: FieldDerivedMeta
  reserveSpace?: boolean
  children: React.ReactNode
}) {
  const value = React.useMemo(() => ({ meta, reserveSpace }), [meta, reserveSpace])

  return (
    <FieldDerivedMetaContext.Provider value={value}>{children}</FieldDerivedMetaContext.Provider>
  )
}

export function useFieldDerivedMetaContext(): FieldDerivedMetaContextValue {
  return React.useContext(FieldDerivedMetaContext)
}
