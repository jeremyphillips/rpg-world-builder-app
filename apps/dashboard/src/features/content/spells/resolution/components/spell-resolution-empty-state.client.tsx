'use client'

import { useFormContext } from 'react-hook-form'
import { Button, Text } from '@rpg/ui'

import { RESOLUTION_SECTION_LABELS } from '../lib/resolution-form-labels'
import {
  createDefaultResolutionFormValues,
  RESOLUTION_FIELD_NAME,
} from '../lib/resolution-form-values'

/** Empty state with Add resolution action (attack preset defaults). */
export function SpellResolutionEmptyState() {
  const { setValue, getValues } = useFormContext()

  return (
    <div className="space-y-3">
      <Text variant="muted" className="text-sm" role="status">
        {RESOLUTION_SECTION_LABELS.emptyState}
      </Text>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          if (getValues(RESOLUTION_FIELD_NAME)) return

          setValue(RESOLUTION_FIELD_NAME, createDefaultResolutionFormValues(), {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          })
        }}
      >
        {RESOLUTION_SECTION_LABELS.addResolution}
      </Button>
    </div>
  )
}
