import { useFormContext, useWatch } from 'react-hook-form'
import { Text } from '@rpg/ui'
import { formatExtendedLevelRange, formatStandardLevelRange } from '@rpg/contracts'

export type LevelRangeSummaryFormValues = {
  maxCharacterLevel: number
  extendedProgressionEnabled: boolean
  extendedTierName?: string
  extendedMaxLevel?: number
}

function useLevelRangeValues() {
  const { control } = useFormContext<LevelRangeSummaryFormValues>()
  const maxCharacterLevel = useWatch({ control, name: 'maxCharacterLevel' })
  const extendedProgressionEnabled = useWatch({ control, name: 'extendedProgressionEnabled' })
  const extendedTierName = useWatch({ control, name: 'extendedTierName' })
  const extendedMaxLevel = useWatch({ control, name: 'extendedMaxLevel' })

  return {
    standardMax: typeof maxCharacterLevel === 'number' ? maxCharacterLevel : 20,
    extendedProgressionEnabled: extendedProgressionEnabled === true,
    extendedTierName: typeof extendedTierName === 'string' ? extendedTierName : undefined,
    extendedMaxLevel: typeof extendedMaxLevel === 'number' ? extendedMaxLevel : undefined,
  }
}

/** Shown under Standard max level when extended progression is off. */
export function StandardLevelRangeSummary() {
  const { standardMax, extendedProgressionEnabled } = useLevelRangeValues()
  if (extendedProgressionEnabled) return null

  return (
    <Text variant="muted" as="p" aria-live="polite">
      {formatStandardLevelRange(standardMax)}
    </Text>
  )
}

/** Shown inside the extended progression group when the toggle is on. */
export function ExtendedLevelRangeSummary() {
  const values = useLevelRangeValues()
  if (!values.extendedProgressionEnabled) return null

  return (
    <Text variant="muted" as="p" aria-live="polite">
      {formatExtendedLevelRange({
        maxCharacterLevel: values.standardMax,
        extendedTierName: values.extendedTierName,
        extendedMaxLevel: values.extendedMaxLevel,
      })}
    </Text>
  )
}
