'use client'

import * as React from 'react'

export type RelationshipArrayController = {
  openFieldPath: string | null
  open: (fieldPath: string) => void
  close: () => void
}

const RelationshipArrayControllerContext = React.createContext<RelationshipArrayController | null>(
  null,
)

export type RelationshipArrayControllerProviderProps = {
  children: React.ReactNode
}

export function RelationshipArrayControllerProvider({
  children,
}: RelationshipArrayControllerProviderProps) {
  const [openFieldPath, setOpenFieldPath] = React.useState<string | null>(null)

  const value = React.useMemo(
    (): RelationshipArrayController => ({
      openFieldPath,
      open: setOpenFieldPath,
      close: () => setOpenFieldPath(null),
    }),
    [openFieldPath],
  )

  return (
    <RelationshipArrayControllerContext.Provider value={value}>
      {children}
    </RelationshipArrayControllerContext.Provider>
  )
}

export function useRelationshipArrayController(): RelationshipArrayController {
  const value = React.useContext(RelationshipArrayControllerContext)
  if (!value) {
    throw new Error(
      'useRelationshipArrayController must be used within RelationshipArrayControllerProvider',
    )
  }
  return value
}

const noopRelationshipArrayController: RelationshipArrayController = {
  openFieldPath: null,
  open: () => undefined,
  close: () => undefined,
}

/** Non-throwing accessor for array append wiring outside explicit controller consumers. */
export function useOptionalRelationshipArrayController(): RelationshipArrayController {
  return React.useContext(RelationshipArrayControllerContext) ?? noopRelationshipArrayController
}
