'use client'

import { formatResolutionSummarySections } from '@rpg/contracts'
import { Alert, Heading, Text } from '@rpg/ui'
import { useWatch } from 'react-hook-form'

import type { ResolutionFormValues } from '../lib/resolution-form-schema'
import { resolutionToStored } from '../lib/resolution-form-values'
import { RESOLUTION_SECTION_LABELS } from '../lib/resolution-form-labels'
import { RESOLUTION_FIELD_NAME } from '../lib/resolution-form-values'

/** Live preview of normalized spell resolution from local form state. */
export function SpellResolutionPreview() {
  const resolution = useWatch({ name: RESOLUTION_FIELD_NAME }) as ResolutionFormValues | undefined
  const stored = resolutionToStored(resolution)

  if (!resolution) {
    return (
      <Alert
        variant="info"
        title={RESOLUTION_SECTION_LABELS.preview}
        role="status"
        aria-live="polite"
      >
        <Text variant="muted" className="text-sm">
          Configure resolution to preview structured summaries here. Prose in the Basics tab remains
          the escape hatch.
        </Text>
      </Alert>
    )
  }

  if (!stored) {
    return (
      <Alert
        variant="info"
        title={RESOLUTION_SECTION_LABELS.preview}
        role="status"
        aria-live="polite"
      >
        <Text variant="muted" className="text-sm">
          Complete target, method, and effects to preview resolution.
        </Text>
      </Alert>
    )
  }

  const sections = formatResolutionSummarySections(stored)

  return (
    <Alert
      variant="info"
      title={RESOLUTION_SECTION_LABELS.preview}
      role="status"
      aria-live="polite"
    >
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.heading} className="space-y-1">
            <Heading as="h4" variant="subsection" className="text-sm font-medium">
              {section.heading}
            </Heading>
            <ul className="list-inside list-disc space-y-1 text-sm">
              {section.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Alert>
  )
}
