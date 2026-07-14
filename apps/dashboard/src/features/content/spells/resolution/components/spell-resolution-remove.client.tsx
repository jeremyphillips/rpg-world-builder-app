'use client'

import { useFormContext, useWatch } from 'react-hook-form'
import { Button } from '@rpg/ui'

import type { ResolutionFormValues } from '../lib/resolution-form-schema'
import { RESOLUTION_SECTION_LABELS } from '../lib/resolution-form-labels'
import { RESOLUTION_FIELD_NAME } from './spell-resolution-empty-state.client'

function hasResolutionContent(resolution: ResolutionFormValues | undefined): boolean {
  if (!resolution) return false

  return Boolean(
    resolution.hitNote?.trim() ||
    resolution.damageType ||
    resolution.rangeDistanceFt !== undefined ||
    resolution.reachDistanceFt !== undefined,
  )
}

/** Removes structured resolution from the spell form after optional confirmation. */
export function SpellResolutionRemoveButton() {
  const { setValue } = useFormContext()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined

  if (!resolution) return null

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
        if (hasResolutionContent(resolution)) {
          const confirmed = window.confirm('Remove structured resolution from this spell?')
          if (!confirmed) return
        }

        setValue(RESOLUTION_FIELD_NAME, undefined, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }}
    >
      {RESOLUTION_SECTION_LABELS.removeResolution}
    </Button>
  )
}
