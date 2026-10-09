'use client'

import * as React from 'react'

const FieldRowAnatomyContext = React.createContext(false)

/** Row span for field columns in a shared label / control / message grid. */
export const FIELD_ANATOMY_GRID_ROW_SPAN = '1 / -1' as const

export type FieldAnatomyGridPlacement = {
  gridColumn: number
  gridRow: typeof FIELD_ANATOMY_GRID_ROW_SPAN
}

const FieldAnatomyGridPlacementContext = React.createContext<FieldAnatomyGridPlacement | null>(null)

/** Sets whether descendants participate in a schema anatomy-grid row. */
export function FieldRowParticipationProvider({
  participates,
  children,
}: {
  participates: boolean
  children: React.ReactNode
}) {
  return (
    <FieldRowAnatomyContext.Provider value={participates}>
      {children}
    </FieldRowAnatomyContext.Provider>
  )
}

/** Marks descendants as participants in a schema anatomy-grid row. */
export function FieldRowAnatomyProvider({ children }: { children: React.ReactNode }) {
  return <FieldRowParticipationProvider participates>{children}</FieldRowParticipationProvider>
}

/** True when rendering inside a schema `kind: 'row'` anatomy grid. */
export function useFieldRowParticipation(): boolean {
  return React.useContext(FieldRowAnatomyContext)
}

/** Applies explicit column placement for a field participant in a parent anatomy grid. */
export function FieldAnatomyGridPlacementProvider({
  gridColumn,
  children,
}: {
  gridColumn: number
  children: React.ReactNode
}) {
  const value = React.useMemo<FieldAnatomyGridPlacement>(
    () => ({
      gridColumn,
      gridRow: FIELD_ANATOMY_GRID_ROW_SPAN,
    }),
    [gridColumn],
  )

  return (
    <FieldAnatomyGridPlacementContext.Provider value={value}>
      {children}
    </FieldAnatomyGridPlacementContext.Provider>
  )
}

/** Grid placement for {@link Field.Root} when nested under a parent anatomy grid shell. */
export function useFieldAnatomyGridPlacement(): FieldAnatomyGridPlacement | null {
  return React.useContext(FieldAnatomyGridPlacementContext)
}
