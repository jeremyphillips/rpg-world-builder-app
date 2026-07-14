'use client'

import { useId } from 'react'
import { useWatch } from 'react-hook-form'
import { Text, TextareaField } from '@rpg/ui'
import { useController, useFormContext } from 'react-hook-form'

import { getSpellResolutionApplicationAmountLabel } from '@rpg/contracts'

import type { ResolutionFormValues } from '../lib/resolution-form-schema'
import { RESOLUTION_FIELD_LABELS, RESOLUTION_SECTION_LABELS } from '../lib/resolution-form-labels'
import { RESOLUTION_FIELD_NAME } from '../lib/resolution-form-values'

function OutcomeLine({ label, amountLabel }: { label: string; amountLabel: string }) {
  return (
    <Text className="text-sm" as="p">
      <Text variant="emphasis" as="span">
        {label}:
      </Text>{' '}
      {amountLabel}
    </Text>
  )
}

/** Read-only outcome summaries plus optional attack hit-note field. */
export function SpellResolutionOutcomes() {
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const noteId = useId()
  const { control } = useFormContext()
  const { field: hitNoteField } = useController({
    control,
    name: `${RESOLUTION_FIELD_NAME}.hitNote`,
  })

  if (!resolution) return null

  const fullLabel = getSpellResolutionApplicationAmountLabel('full')
  const halfLabel = getSpellResolutionApplicationAmountLabel('half')

  return (
    <div className="space-y-3">
      {resolution.methodKind === 'attack' ? (
        <>
          <OutcomeLine label="Hit" amountLabel={fullLabel} />
          <TextareaField
            id={noteId}
            label={RESOLUTION_FIELD_LABELS.hitNote}
            rows={3}
            width="full"
            {...hitNoteField}
          />
        </>
      ) : (
        <>
          <OutcomeLine label="Failed save" amountLabel={fullLabel} />
          <OutcomeLine label="Successful save" amountLabel={halfLabel} />
        </>
      )}
      <Text variant="muted" className="text-xs" as="p">
        {RESOLUTION_SECTION_LABELS.outcomes} are generated from the damage entered above.
      </Text>
    </div>
  )
}
