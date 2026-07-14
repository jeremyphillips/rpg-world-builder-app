'use client'

import { useWatch } from 'react-hook-form'
import { Text } from '@rpg/ui'

import { RESOLUTION_FIELD_LABELS } from '../lib/resolution-form-labels'
import { RESOLUTION_FIELD_NAME } from '../lib/resolution-form-values'

/** MVP target count display — fixed at one for scoped spells. */
export function SpellResolutionTargetCount() {
  const targetCount = useWatch({ name: `${RESOLUTION_FIELD_NAME}.targetCount` }) as
    | number
    | undefined

  if (targetCount === undefined) return null

  const label = targetCount === 1 ? 'One' : String(targetCount)

  return (
    <div className="space-y-1">
      <Text variant="muted" className="text-xs font-medium">
        {RESOLUTION_FIELD_LABELS.targetCount}
      </Text>
      <Text className="text-sm">{label}</Text>
    </div>
  )
}
