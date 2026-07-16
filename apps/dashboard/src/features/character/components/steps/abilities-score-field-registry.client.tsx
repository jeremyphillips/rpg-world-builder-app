'use client'

import { ABILITY_IDS } from '@rpg/contracts'
import { useFormContext } from 'react-hook-form'

import type { AbilitiesFormValues } from '../../lib/steps/abilities-form-fields'

/**
 * Registers ability score form paths with RHF. Slot UIs update scores via setValue;
 * without registered fields, watch/getValues omit them and draft sync fails on navigation.
 */
export function AbilitiesScoreFieldRegistry() {
  const { register } = useFormContext<AbilitiesFormValues>()

  return (
    <div className="sr-only" aria-hidden>
      {ABILITY_IDS.map((ability) => (
        <input key={ability} type="hidden" {...register(ability)} />
      ))}
    </div>
  )
}
