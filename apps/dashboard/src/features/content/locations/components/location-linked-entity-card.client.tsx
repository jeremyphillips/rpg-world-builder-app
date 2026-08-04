'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Text } from '@rpg/ui'

export type LocationLinkedEntityCardProps = {
  name: string
  href?: string
  summaryLine?: string
  meta?: ReactNode
}

export function LocationLinkedEntityCard({
  name,
  href,
  summaryLine,
  meta,
}: LocationLinkedEntityCardProps) {
  const title = href ? (
    <Link to={href} className="text-link font-medium hover:underline">
      {name}
    </Link>
  ) : (
    <Text as="span" className="font-medium">
      {name}
    </Text>
  )

  return (
    <article className="flex items-start justify-between gap-3 rounded-md border border-border px-4 py-2.5">
      <div className="min-w-0 space-y-1">
        {title}
        {summaryLine ? (
          <Text variant="muted" className="text-sm">
            {summaryLine}
          </Text>
        ) : null}
      </div>
      {meta ? <div className="shrink-0">{meta}</div> : null}
    </article>
  )
}
