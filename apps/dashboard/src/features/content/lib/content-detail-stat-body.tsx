import type { ReactNode } from 'react'
import { Heading, Text } from '@rpg/ui'

import { ContentStatRow } from './content-stat-row'
import type { ContentStatRowData } from './content-stat-rows'

export type ContentDetailStatBodyProps = {
  name: string
  statRows: ContentStatRowData[]
  /** Plain-text description rendered as muted body copy. */
  description?: string | null
  /** Custom description content (e.g. rich text). Takes precedence over `description`. */
  descriptionContent?: ReactNode
}

/**
 * Shared heading, stat rows, and optional description block for content detail pages.
 */
export function ContentDetailStatBody({
  name,
  statRows,
  description,
  descriptionContent,
}: ContentDetailStatBodyProps) {
  const resolvedDescription =
    descriptionContent ?? (description ? <Text variant="muted">{description}</Text> : null)

  return (
    <div className="space-y-4">
      <Heading variant="display" as="h2">
        {name}
      </Heading>
      <div className="space-y-3">
        {statRows.map(({ label, value }) => (
          <ContentStatRow key={label} label={label} value={value} />
        ))}
      </div>
      {resolvedDescription}
    </div>
  )
}
