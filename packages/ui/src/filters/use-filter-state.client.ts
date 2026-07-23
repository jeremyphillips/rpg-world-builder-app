'use client'

import * as React from 'react'

import {
  createInitialFilterState,
  resetFilterState,
  setFilterValue,
} from './filter-engine'
import type { FilterFieldId, FilterSchema } from './filter-schema.types'

export type UseFilterStateOptions<TState extends Record<string, unknown>> = {
  initialValues?: Partial<TState>
}

export function useFilterState<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  options?: UseFilterStateOptions<TState>,
) {
  const [state, setState] = React.useState<TState>(() => ({
    ...createInitialFilterState(schema),
    ...options?.initialValues,
  }))

  const setValue = React.useCallback(
    (id: FilterFieldId<TState>, value: TState[FilterFieldId<TState>] | undefined) => {
      setState((current) => setFilterValue(schema, current, id, value))
    },
    [schema],
  )

  const reset = React.useCallback(() => {
    setState(resetFilterState(schema))
  }, [schema])

  return { state, setValue, reset }
}
