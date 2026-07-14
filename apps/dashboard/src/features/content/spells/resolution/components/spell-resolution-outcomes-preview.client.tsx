'use client'

import { formatResolutionOutcomeLine } from '@rpg/contracts'
import { Alert, Text } from '@rpg/ui'
import { useWatch } from 'react-hook-form'

import type { ResolutionFormValues } from '../lib/resolution-form-schema'
import { RESOLUTION_SECTION_LABELS } from '../lib/resolution-form-labels'
import { resolutionToStored, RESOLUTION_FIELD_NAME } from '../lib/resolution-form-values'

/** Read-only preview of stored or synthesized resolution outcomes. */
export function SpellResolutionOutcomesPreview() {
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const stored = resolutionToStored(resolution)

  if (!resolution) {
    return null
  }

  if (!stored?.outcomes.length) {
    return (
      <Alert variant="info" title={RESOLUTION_SECTION_LABELS.outcomes} role="status">
        <Text variant="muted" className="text-sm">
          {RESOLUTION_SECTION_LABELS.outcomesIncomplete}
        </Text>
      </Alert>
    )
  }

  return (
    <Alert
      variant="info"
      title={RESOLUTION_SECTION_LABELS.outcomes}
      role="status"
      aria-live="polite"
    >
      <ul className="list-inside list-disc space-y-1 text-sm">
        {stored.outcomes.map((outcome) => (
          <li key={outcome.result}>{formatResolutionOutcomeLine(outcome, stored)}</li>
        ))}
      </ul>
    </Alert>
  )
}
