'use client'

import { formatResolutionProjectilesPreview } from '@rpg/contracts'
import { Text } from '@rpg/ui'
import { useWatch } from 'react-hook-form'

import { applicationPatternFromForm } from '../lib/resolution-application-pattern.lib'
import type { ResolutionFormValues } from '../lib/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../lib/resolution-form-values'

/** Live preview sentence for the projectiles conditional group. */
export function SpellResolutionProjectilesPreview() {
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const pattern = resolution ? applicationPatternFromForm(resolution) : undefined

  if (pattern?.kind !== 'projectiles') return null

  return (
    <Text as="p" variant="muted" className="text-sm" role="status">
      {formatResolutionProjectilesPreview(pattern)}
    </Text>
  )
}
