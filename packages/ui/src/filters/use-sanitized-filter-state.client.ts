'use client'

import * as React from 'react'

import { sanitizeFilterState, isShallowFilterStateEqual } from './filter-engine'
import type { FilterSchema } from './filter-schema.types'

export type UseSanitizedFilterStateOptions<TData, TState extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TState>
  state: TState
  onStateChange: (state: TState) => void
  data?: readonly TData[]
  enabled?: boolean
}

export function useSanitizedFilterState<TData, TState extends Record<string, unknown>>({
  schema,
  state,
  onStateChange,
  data,
  enabled = true,
}: UseSanitizedFilterStateOptions<TData, TState>) {
  const stateRef = React.useRef(state)
  stateRef.current = state

  const onStateChangeRef = React.useRef(onStateChange)
  onStateChangeRef.current = onStateChange

  React.useEffect(() => {
    if (!enabled) return

    const current = stateRef.current
    const sanitized = sanitizeFilterState(schema, current, { data })
    if (!isShallowFilterStateEqual(sanitized, current)) {
      onStateChangeRef.current(sanitized)
    }
  }, [schema, data, enabled])
}
