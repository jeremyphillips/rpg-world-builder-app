'use client'

import * as React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useFormUiContext } from '../context/form-ui.context'

const DEFAULT_DEBOUNCE_MS = 300

export interface UseSilentFormValidityOptions {
  debounceMs?: number
  /** When false, skips resolver checks (e.g. edit-mode footers). Defaults to true. */
  enabled?: boolean
}

export interface UseSilentFormValidityResult {
  /** Whether current values pass the submit resolver without RHF errors. */
  canSubmit: boolean
  /** True until the first debounced check completes (when enabled). */
  isChecking: boolean
}

/**
 * Debounced create-mode validity for footer gating. Uses `validateSilently` from
 * context — the same resolver path as submit — without calling `form.trigger()`.
 */
export function useSilentFormValidity({
  debounceMs = DEFAULT_DEBOUNCE_MS,
  enabled = true,
}: UseSilentFormValidityOptions = {}): UseSilentFormValidityResult {
  const { validateSilently } = useFormUiContext()
  const { control, getValues } = useFormContext()
  const watchedValues = useWatch({ control })

  const [canSubmit, setCanSubmit] = React.useState(false)
  const [isChecking, setIsChecking] = React.useState(enabled)
  const hasResultRef = React.useRef(false)
  const requestIdRef = React.useRef(0)
  const isFirstRunRef = React.useRef(true)

  React.useEffect(() => {
    if (!enabled) {
      hasResultRef.current = false
      isFirstRunRef.current = true
      return
    }

    if (!validateSilently) {
      return
    }

    const requestId = ++requestIdRef.current
    const delay = isFirstRunRef.current ? 0 : debounceMs
    isFirstRunRef.current = false

    if (!hasResultRef.current) {
      setIsChecking(true)
    }

    const timeoutId = setTimeout(() => {
      void (async () => {
        const result = await validateSilently(getValues())
        if (requestId !== requestIdRef.current) return
        hasResultRef.current = true
        setCanSubmit(result.valid)
        setIsChecking(false)
      })()
    }, delay)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [enabled, validateSilently, getValues, debounceMs, watchedValues])

  if (!enabled) {
    return { canSubmit: true, isChecking: false }
  }

  if (!validateSilently) {
    return { canSubmit: false, isChecking: false }
  }

  return { canSubmit, isChecking }
}
