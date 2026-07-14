'use client'

import { SelectField } from '@rpg/ui'
import { useId } from 'react'
import { useWatch } from 'react-hook-form'

import {
  RESOLUTION_FIELD_LABELS,
  resolutionProximityKindOptions,
} from '../lib/resolution-form-labels'
import type { ResolutionFormValues } from '../lib/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../lib/resolution-form-values'
import { useResolutionEditorContext } from '../lib/use-resolution-change-confirm.client'

/** Proximity select routed through confirm-first change planning. */
export function SpellResolutionProximitySelect() {
  const id = useId()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const { requestResolutionChange } = useResolutionEditorContext()

  if (!resolution) return null

  return (
    <SelectField
      id={id}
      label={RESOLUTION_FIELD_LABELS.proximityKind}
      value={resolution.proximityKind}
      onValueChange={(next) => {
        requestResolutionChange({
          field: 'proximityKind',
          value: next as ResolutionFormValues['proximityKind'],
        })
      }}
      options={resolutionProximityKindOptions}
      width="md"
      required
    />
  )
}
