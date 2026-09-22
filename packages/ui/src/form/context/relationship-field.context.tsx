'use client'

import * as React from 'react'

export type RelationshipFieldPickerProps<TEdge, TSelection, TContext> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: readonly TEdge[]
  onAdd: (selection: TSelection) => void | Promise<void>
  context: TContext
  disabled?: boolean
}

export type RelationshipFieldAdapter<TEdge = unknown, TSelection = unknown, TContext = unknown> = {
  renderPicker: (
    props: RelationshipFieldPickerProps<TEdge, TSelection, TContext>,
  ) => React.ReactNode
  createEdge: (selection: TSelection, items: readonly TEdge[], context: TContext) => TEdge
  canAdd?: (items: readonly TEdge[], context: TContext) => boolean
}

export type RelationshipFieldRegistry = Record<
  string,
  RelationshipFieldAdapter<unknown, unknown, unknown>
>

export type RelationshipFieldContextValue<TContext = unknown> = {
  context: TContext
  registry: RelationshipFieldRegistry
}

const RelationshipFieldContext = React.createContext<RelationshipFieldContextValue | null>(null)

export type RelationshipFieldProviderProps<TContext> = {
  context: TContext
  registry: RelationshipFieldRegistry
  children: React.ReactNode
}

export function RelationshipFieldProvider<TContext>({
  context,
  registry,
  children,
}: RelationshipFieldProviderProps<TContext>) {
  const value = React.useMemo(() => ({ context, registry }), [context, registry])

  return (
    <RelationshipFieldContext.Provider value={value as RelationshipFieldContextValue}>
      {children}
    </RelationshipFieldContext.Provider>
  )
}

export function useRelationshipFieldContext(): RelationshipFieldContextValue {
  const value = React.useContext(RelationshipFieldContext)
  if (!value) {
    throw new Error('useRelationshipFieldContext must be used within RelationshipFieldProvider')
  }
  return value
}

export function resolveRelationshipFieldAdapter(
  registry: RelationshipFieldRegistry,
  vocabulary: string,
): RelationshipFieldAdapter {
  const adapter = registry[vocabulary]
  if (!adapter) {
    throw new Error(`No relationship field adapter registered for vocabulary "${vocabulary}".`)
  }
  return adapter
}
