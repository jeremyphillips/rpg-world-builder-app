import { SelectField } from '@rpg/ui'
import { useId } from 'react'
import { useWatch } from 'react-hook-form'

import type { SpellResolutionSelectionMode } from '@rpg/contracts'

import { useResolutionEditorContext } from '../../hooks/use-resolution-change-confirm'
import {
  RESOLUTION_FIELD_LABELS,
  resolutionSelectionModeOptions,
} from '../../lib/form/resolution-form-labels'
import type { ResolutionFormValues } from '../../lib/form/resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from '../../lib/form/resolution-form-values'

/** Selection mode select routed through confirm-first change planning. */
export function SpellResolutionSelectionModeSelect() {
  const id = useId()
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const { requestResolutionChange } = useResolutionEditorContext()

  if (!resolution) return null

  return (
    <SelectField
      id={id}
      label={RESOLUTION_FIELD_LABELS.selectionMode}
      value={resolution.selectionMode}
      onValueChange={(next) => {
        requestResolutionChange({
          field: 'selectionMode',
          value: next as SpellResolutionSelectionMode,
        })
      }}
      options={resolutionSelectionModeOptions}
      width="md"
      required
    />
  )
}
