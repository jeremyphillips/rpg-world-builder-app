'use client'

import { useFormContext } from 'react-hook-form'
import { Button, Text } from '@rpg/ui'

import { RESOLUTION_SECTION_LABELS } from '../lib/resolution-form-labels'
import { createDefaultAttackResolutionFormValues } from '../lib/resolution-form-values'

export const RESOLUTION_FIELD_NAME = 'resolution' as const

/** Empty state with Add resolution action (attack preset defaults). */
export function SpellResolutionEmptyState() {
  const { setValue } = useFormContext()

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
          setValue(RESOLUTION_FIELD_NAME, createDefaultAttackResolutionFormValues(), {
            shouldDirty: true,
            shouldValidate: true,
          })
        }}
      >
        {RESOLUTION_SECTION_LABELS.addResolution}
      </Button>
    </div>
  )
}
