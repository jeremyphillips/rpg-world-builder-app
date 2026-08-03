'use client'

import { Link } from 'react-router-dom'
import { Text } from '@rpg/ui'

import { LOCATION_SECTION_LABELS, type LocationAncestrySegment } from '../lib/location-display'

export type LocationAncestryProps = {
  segments: LocationAncestrySegment[]
  currentName: string
}

export function LocationAncestry({ segments, currentName }: LocationAncestryProps) {
  if (segments.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="location-ancestry-heading" className="space-y-2">
      <Text variant="muted" id="location-ancestry-heading" as="h2" className="text-sm font-medium">
        {LOCATION_SECTION_LABELS.ancestry}
      </Text>
      <nav aria-label={LOCATION_SECTION_LABELS.ancestry}>
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-muted-foreground">
          {segments.map((segment, index) => (
            <li key={segment.id} className="inline-flex items-center gap-x-1">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              <Link to={segment.href} className="text-link hover:underline">
                {segment.name}
              </Link>
            </li>
          ))}
          <li className="inline-flex items-center gap-x-1">
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-foreground">
              {currentName}
            </span>
          </li>
        </ol>
      </nav>
    </section>
  )
}
