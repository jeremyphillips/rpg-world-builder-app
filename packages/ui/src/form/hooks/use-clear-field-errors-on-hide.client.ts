'use client'

import * as React from 'react'
import type { FieldPath, FieldValues } from 'react-hook-form'
import { useFormContext } from 'react-hook-form'

/** Secondary hygiene — clears RHF errors when a gated field region hides. */
export function useClearFieldErrorsOnHide(
  visible: boolean,
  boundNames: readonly FieldPath<FieldValues>[],
) {
  const { clearErrors } = useFormContext()
  const wasVisibleRef = React.useRef(visible)
  const boundKey = boundNames.join('\0')

  React.useEffect(() => {
    if (wasVisibleRef.current && !visible && boundNames.length > 0) {
      clearErrors(boundNames)
    }
    wasVisibleRef.current = visible
  }, [boundKey, boundNames, clearErrors, visible])
}
