'use client'

import { useController, useFormContext } from 'react-hook-form'
import { useArrayFieldContext } from '@rpg/ui/form'

/** Keeps `effectId` registered while only `amount` is edited in the array item UI. */
export function SpellResolutionOutcomeApplicationEffectIdField() {
  const arrayContext = useArrayFieldContext()
  const { control } = useFormContext()

  if (!arrayContext?.fullArrayName) return null

  const name = `${arrayContext.fullArrayName}.${arrayContext.rowIndex}.effectId`
  const { field } = useController({ control, name })

  return <input type="hidden" {...field} value={field.value ?? ''} />
}
