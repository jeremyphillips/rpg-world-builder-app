'use client'

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import type { LocationFixedCreateContext } from '../lib/location-form-ctx'

/** Registers fixed create context on the form so conditional fields can watch locked values. */
export function LocationFixedCreateHiddenFields({
  fixedCreate,
}: {
  fixedCreate: LocationFixedCreateContext
}) {
  const { register, setValue } = useFormContext()

  useEffect(() => {
    register('authoringType')
    setValue('authoringType', fixedCreate.authoringType, {
      shouldDirty: false,
      shouldValidate: false,
    })

    if (fixedCreate.parent?.kind === 'fixed') {
      register('parentLocationId')
      setValue('parentLocationId', fixedCreate.parent.locationId, {
        shouldDirty: false,
        shouldValidate: false,
      })
    }

    if (fixedCreate.settlementType) {
      register('settlementType')
      setValue('settlementType', fixedCreate.settlementType, {
        shouldDirty: false,
        shouldValidate: false,
      })
    }
  }, [fixedCreate, register, setValue])

  return null
}
