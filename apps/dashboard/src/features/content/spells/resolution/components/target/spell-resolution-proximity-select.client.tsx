'use client'

import { SelectField } from '@rpg/ui'
import { useId } from 'react'
import { useWatch } from 'react-hook-form'

import { useResolutionEditorContext } from '../../hooks/use-resolution-change-confirm.client'
import {
  RESOLUTION_FIELD_LABELS,
  resolutionProximityKindOptions,
} from '../../lib/form/resolution-form-labels'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'

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
