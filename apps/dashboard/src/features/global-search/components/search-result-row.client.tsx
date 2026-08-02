'use client'

import { Link } from 'react-router-dom'

import { InlineInactiveStatus, Text, cn } from '@rpg/ui'

import {
  searchResultRowHeaderVariants,
  searchResultRowTitleRowVariants,
  searchResultRowTypeLabelVariants,
  searchResultRowVariants,
} from './search-result-row.variants'

export const SEARCH_RESULT_UNAVAILABLE_LABEL = 'Unavailable'

export type SearchResultRowProps = {
  title: string
  secondary: string
  typeLabel: string
  href: string
  campaignUnavailable?: boolean
  onActivate?: () => void
  className?: string
}

export function SearchResultRow({
  title,
  secondary,
  typeLabel,
  href,
  campaignUnavailable = false,
  onActivate,
  className,
}: SearchResultRowProps) {
  const accessibleName = campaignUnavailable
    ? `${title}, ${SEARCH_RESULT_UNAVAILABLE_LABEL}, ${typeLabel}`
    : `${title}, ${typeLabel}`

  const content = (
    <>
      <div className={searchResultRowHeaderVariants()}>
        <span className={searchResultRowTitleRowVariants()}>
          <Text as="span" className="min-w-0 truncate text-sm text-foreground">
            {title}
          </Text>
          {campaignUnavailable ? (
            <InlineInactiveStatus label={SEARCH_RESULT_UNAVAILABLE_LABEL} />
          ) : null}
        </span>
        <Text as="span" className={searchResultRowTypeLabelVariants()}>
          {typeLabel}
        </Text>
      </div>
      {secondary ? (
        <Text as="p" variant="muted" className="mt-1 text-sm">
          {secondary}
        </Text>
      ) : null}
    </>
  )

  return (
    <Link
      to={href}
      className={cn(searchResultRowVariants(), className)}
      onClick={onActivate}
      aria-label={accessibleName}
    >
      {content}
    </Link>
  )
}
