'use client'

import * as React from 'react'

import { resetFilterState, sanitizeFilterState, setFilterValue } from './filter-engine'
import type { FilterFieldId, FilterSchema } from './filter-schema.types'

export type UseFilterStateOptions<TData, TState extends Record<string, unknown>> = {
  initialValues?: Partial<TState>
  data?: readonly TData[]
}

export function useFilterState<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  options?: UseFilterStateOptions<TData, TState>,
) {
  const [state, setState] = React.useState<TState>(() =>
    sanitizeFilterState(schema, options?.initialValues ?? {}, { data: options?.data }),
  )

  const setValue = React.useCallback(
    (id: FilterFieldId<TState>, value: TState[FilterFieldId<TState>] | undefined) => {
      setState((current) => setFilterValue(schema, current, id, value))
    },
    [schema],
  )

  const reset = React.useCallback(() => {
    setState(resetFilterState(schema))
  }, [schema])

  const sanitize = React.useCallback(
    (partial: Partial<TState>) => {
      setState(sanitizeFilterState(schema, partial, { data: options?.data }))
    },
    [options?.data, schema],
  )

  return { state, setValue, reset, sanitize }
}
