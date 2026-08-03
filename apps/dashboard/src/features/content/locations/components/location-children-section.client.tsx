'use client'

import { Link } from 'react-router-dom'
import { Heading, Text } from '@rpg/ui'

import { LOCATION_SECTION_LABELS, type LocationChildrenViewModel } from '../lib/location-display'

export type LocationChildrenSectionProps = {
  childrenViewModel: LocationChildrenViewModel
  headerActions?: React.ReactNode
}

export function LocationChildrenSection({
  childrenViewModel,
  headerActions,
}: LocationChildrenSectionProps) {
  const { items, emptyText } = childrenViewModel

  return (
    <section aria-labelledby="location-children-heading" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Heading variant="group" as="h2" id="location-children-heading">
          {LOCATION_SECTION_LABELS.children}
        </Heading>
        {headerActions}
      </div>

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
