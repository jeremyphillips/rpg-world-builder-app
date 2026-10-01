'use client'

import * as React from 'react'

export function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(node)
    return
  }
  ref.current = node
}

/** Merges a local ref with an optional forwarded ref for focus and imperative callers. */
export function useComposedRef<T>(
  localRef: React.MutableRefObject<T | null>,
  forwardedRef?: React.Ref<T>,
) {
  return React.useCallback(
    (node: T | null) => {
      localRef.current = node
      assignRef(forwardedRef, node)
    },
    [forwardedRef, localRef],
  )
}
