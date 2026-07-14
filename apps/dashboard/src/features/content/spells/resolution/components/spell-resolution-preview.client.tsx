'use client'

import { formatResolutionSummarySections } from '@rpg/contracts'
import { Heading, Text } from '@rpg/ui'
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
      <Text variant="muted" className="text-sm" role="status">
        Configure resolution to preview structured summaries here. Prose in the Basics tab remains
        the escape hatch.
      </Text>
    )
  }

  if (!stored) {
    return (
      <Text variant="muted" className="text-sm" role="status">
        Complete target, method, range, and damage to preview resolution.
      </Text>
    )
  }

  const sections = formatResolutionSummarySections(stored)

  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <Text variant="emphasis" as="span" className="text-sm">
        {RESOLUTION_SECTION_LABELS.preview}
      </Text>
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
  )
}
