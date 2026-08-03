'use client'

import { Link } from 'react-router-dom'
import { Heading, Text } from '@rpg/ui'

import { LOCATION_SECTION_LABELS, type LocationChildrenViewModel } from '../lib/location-display'

export type LocationChildrenSectionProps = {
  childrenViewModel: LocationChildrenViewModel
}

export function LocationChildrenSection({ childrenViewModel }: LocationChildrenSectionProps) {
  const { items, emptyText } = childrenViewModel

  return (
    <section aria-labelledby="location-children-heading" className="space-y-4">
      <Heading variant="group" as="h2" id="location-children-heading">
        {LOCATION_SECTION_LABELS.children}
      </Heading>

      {items.length === 0 ? (
        <Text variant="muted">{emptyText}</Text>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link to={item.href} className="text-link hover:underline">
                {item.name}
              </Link>
              <Text variant="muted" className="ml-2 inline">
                {item.kindLabel}
              </Text>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
