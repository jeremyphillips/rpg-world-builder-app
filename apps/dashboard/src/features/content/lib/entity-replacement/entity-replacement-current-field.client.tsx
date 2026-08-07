'use client'

import { Heading, InsetPanel } from '@rpg/ui'

import { ContentEntityCard } from '../content-entity-card.client'

export type EntityReplacementCurrentFieldProps = {
  label: string
  heading: string
  subheading?: string
  metadata?: string
  imageKey?: string
}

export function EntityReplacementCurrentField({
  label,
  heading,
  subheading,
  metadata,
  imageKey,
}: EntityReplacementCurrentFieldProps) {
  return (
    <div className="space-y-2">
      <Heading variant="label" as="p">
        {label}
      </Heading>
      <InsetPanel size="sm" className="p-0">
        <ContentEntityCard
          chrome="embedded"
          density="compact"
          heading={heading}
          subheading={subheading}
          metadata={metadata}
          imageKey={imageKey}
        />
      </InsetPanel>
    </div>
  )
}
