'use client'

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'

import type { LocationAuthoringType } from '../lib/location-authoring-type'

/** Registers fixed create context on the form so conditional fields can watch authoringType. */
export function LocationFixedCreateHiddenFields({
  authoringType,
  parentLocationId,
}: {
  authoringType: LocationAuthoringType
  parentLocationId: string
}) {
  const { register, setValue } = useFormContext()

  useEffect(() => {
    register('authoringType')
    register('parentLocationId')
    setValue('authoringType', authoringType, { shouldDirty: false, shouldValidate: false })
    setValue('parentLocationId', parentLocationId, { shouldDirty: false, shouldValidate: false })
  }, [authoringType, parentLocationId, register, setValue])

  return null
}
