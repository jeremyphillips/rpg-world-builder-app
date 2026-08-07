'use client'

import { Heading } from '@rpg/ui'

import { ContentEntityCard } from '../content-entity-card.client'

export type RelationshipDrawerCurrentEntityFieldProps = {
  label: string
  heading: string
  subheading?: string
  imageKey?: string
}

export function RelationshipDrawerCurrentEntityField({
  label,
  heading,
  subheading,
  imageKey,
}: RelationshipDrawerCurrentEntityFieldProps) {
  return (
    <div className="space-y-2">
      <Heading variant="label" as="p">
        {label}
      </Heading>
      <ContentEntityCard
        chrome="embedded"
        density="compact"
        heading={heading}
        subheading={subheading}
        imageKey={imageKey}
      />
    </div>
  )
}
