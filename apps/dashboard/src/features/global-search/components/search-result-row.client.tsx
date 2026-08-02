'use client'

import { Link } from 'react-router-dom'

import { Text, cn } from '@rpg/ui'

import {
  searchResultRowHeaderVariants,
  searchResultRowTypeLabelVariants,
  searchResultRowVariants,
} from './search-result-row.variants'

export type SearchResultRowProps = {
  title: string
  secondary: string
  typeLabel: string
  href: string
  onActivate?: () => void
  className?: string
}

export function SearchResultRow({
  title,
  secondary,
  typeLabel,
  href,
  onActivate,
  className,
}: SearchResultRowProps) {
  const content = (
    <>
      <div className={searchResultRowHeaderVariants()}>
        <Text as="span" className="min-w-0 text-sm text-foreground">
          {title}
        </Text>
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
      aria-label={`${title}, ${typeLabel}`}
    >
      {content}
    </Link>
  )
}
