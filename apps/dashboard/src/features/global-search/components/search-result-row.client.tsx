'use client'

import { Link } from 'react-router-dom'

import { InlineInactiveStatus, Text, cn } from '@rpg/ui'

import { INACTIVE_ROW_BADGE_LABEL } from '@/lib/availability'

import {
  searchResultRowHeaderVariants,
  searchResultRowInsetContentVariants,
  searchResultRowSecondaryVariants,
  searchResultRowTitleRowVariants,
  searchResultRowTitleVariants,
  searchResultRowTypeLabelVariants,
  searchResultRowVariants,
} from './search-result-row.variants'

export type SearchResultRowInset = 'panel'

export type SearchResultRowProps = {
  title: string
  secondary: string
  typeLabel: string
  href: string
  campaignUnavailable?: boolean
  onActivate?: () => void
  inset?: SearchResultRowInset
  className?: string
}

export function SearchResultRow({
  title,
  secondary,
  typeLabel,
  href,
  campaignUnavailable = false,
  onActivate,
  inset,
  className,
}: SearchResultRowProps) {
  const accessibleName = campaignUnavailable
    ? `${title}, ${INACTIVE_ROW_BADGE_LABEL}, ${typeLabel}`
    : `${title}, ${typeLabel}`

  const content = (
    <div className={searchResultRowInsetContentVariants({ inset: inset ?? 'none' })}>
      <div className={searchResultRowHeaderVariants()}>
        <span className={searchResultRowTitleRowVariants()}>
          <Text as="span" className={searchResultRowTitleVariants()}>
            {title}
          </Text>
          {campaignUnavailable ? <InlineInactiveStatus label={INACTIVE_ROW_BADGE_LABEL} /> : null}
        </span>
        <Text as="span" className={searchResultRowTypeLabelVariants()}>
          {typeLabel}
        </Text>
      </div>
      {secondary ? (
        <Text
          as="p"
          variant="muted"
          className={searchResultRowSecondaryVariants({ inset: inset ?? 'none' })}
        >
          {secondary}
        </Text>
      ) : null}
    </div>
  )

  return (
    <Link
      to={href}
      className={cn(searchResultRowVariants({ inset: inset ?? 'none' }), className)}
      onClick={onActivate}
      aria-label={accessibleName}
    >
      {content}
    </Link>
  )
}
