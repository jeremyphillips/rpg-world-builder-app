'use client'

import { formatResolutionEffectsApplicationLabel } from '@rpg/contracts'
import { Text } from '@rpg/ui'
import { useWatch } from 'react-hook-form'

import { applicationPatternFromForm } from '../lib/resolution-application-pattern.lib'
import type { ResolutionFormValues } from '../lib/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../lib/resolution-form-values'

/** Supporting label beneath the Effects section legend. */
export function SpellResolutionEffectsApplicationLabel() {
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined

  if (!resolution) return null

  return (
    <Text as="p" variant="muted" className="text-sm" role="status">
      {formatResolutionEffectsApplicationLabel({
        applicationPattern: applicationPatternFromForm(resolution),
      })}
    </Text>
  )
}
