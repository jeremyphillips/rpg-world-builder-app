'use client'

import * as React from 'react'

export type ArrayAddActionInterceptHandler = {
  onSelect: () => void
}

export type ArrayAddActionInterceptRegistry = Record<string, ArrayAddActionInterceptHandler>

const ArrayAddActionInterceptContext = React.createContext<ArrayAddActionInterceptRegistry | null>(
  null,
)

export type ArrayAddActionInterceptProviderProps = {
  registry: ArrayAddActionInterceptRegistry
  children: React.ReactNode
}

/** Replaces default array append for keyed add actions (e.g. picker-driven collections). */
export function ArrayAddActionInterceptProvider({
  registry,
  children,
}: ArrayAddActionInterceptProviderProps) {
  const value = React.useMemo(() => registry, [registry])
  return (
    <ArrayAddActionInterceptContext.Provider value={value}>
      {children}
    </ArrayAddActionInterceptContext.Provider>
  )
}

export function useArrayAddActionIntercept(
  interceptKey?: string,
): ArrayAddActionInterceptHandler | undefined {
  const registry = React.useContext(ArrayAddActionInterceptContext)
  if (!interceptKey || !registry) return undefined
  return registry[interceptKey]
}
