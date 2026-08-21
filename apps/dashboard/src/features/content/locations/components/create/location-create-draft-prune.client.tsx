'use client'

import { useEffect, useRef } from 'react'
import { useFormContext } from 'react-hook-form'

import {
  mergeLocationCreateDraftForFixedCreate,
  resolveLocationFixedCreateCompositionKey,
} from '../../lib/create/session/location-create-draft.lib'
import type { LocationFixedCreateContext } from '../../lib/forms/location-form-ctx'
import type { LocationFormValues } from '../../lib/forms/location-form-fields'

/** Preserves compatible draft fields when setup changes fixed-create composition. */
export function LocationCreateDraftPrune({
  fixedCreate,
}: {
  fixedCreate: LocationFixedCreateContext
}) {
  const form = useFormContext<LocationFormValues>()
  const compositionKey = resolveLocationFixedCreateCompositionKey(fixedCreate)
  const previousKeyRef = useRef(compositionKey)

  useEffect(() => {
    if (previousKeyRef.current === compositionKey) return
    previousKeyRef.current = compositionKey
    const currentValues = form.getValues()
    form.reset(
      mergeLocationCreateDraftForFixedCreate({
        currentValues,
        fixedCreate,
      }),
    )
  }, [compositionKey, fixedCreate, form])

  return null
}
