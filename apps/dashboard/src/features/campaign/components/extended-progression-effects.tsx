import { useEffect } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { defaultExtendedMaxLevel } from '@rpg/contracts'

import type { LevelRangeSummaryFormValues } from './level-range-summary'

/** Resets extended fields when disabled; seeds default extended max when enabled. */
export function ExtendedProgressionEffects() {
  const { control, setValue } = useFormContext<
    LevelRangeSummaryFormValues & { extendedTierName?: string; extendedMaxLevel?: number }
  >()
  const extendedProgressionEnabled = useWatch({ control, name: 'extendedProgressionEnabled' })
  const maxCharacterLevel = useWatch({ control, name: 'maxCharacterLevel' })
  const extendedMaxLevel = useWatch({ control, name: 'extendedMaxLevel' })

  useEffect(() => {
    if (!extendedProgressionEnabled) {
      setValue('extendedTierName', '', { shouldDirty: true })
      setValue('extendedMaxLevel', undefined, { shouldDirty: true })
      return
    }

    const standardMax = typeof maxCharacterLevel === 'number' ? maxCharacterLevel : 20
    if (extendedMaxLevel === undefined || extendedMaxLevel === null) {
      setValue('extendedMaxLevel', defaultExtendedMaxLevel(standardMax), { shouldDirty: true })
    }
  }, [extendedProgressionEnabled, extendedMaxLevel, maxCharacterLevel, setValue])

  return null
}
