'use client'

import { Link } from 'react-router-dom'

import {
  formatViewerCharacterRelationshipTooltip,
  type ViewerCharacterRelationships,
} from '@rpg/contracts'
import { InlineInactiveStatus, Text, cn } from '@rpg/ui'

import { INACTIVE_ROW_BADGE_LABEL } from '@/lib/availability'
import { CharacterRelationshipIndicator } from '@/lib/character-relationships/character-relationship-indicator.client'

import type { GlobalSearchSurfaceContext } from '../lib/global-search-surface.variants'
import {
  searchResultRowHeaderVariants,
  searchResultRowSecondaryVariants,
  searchResultRowTitleRowVariants,
  searchResultRowTitleVariants,
  searchResultRowTypeLabelVariants,
  searchResultRowVariants,
  type SearchResultRowDensity,
} from './search-result-row.variants'

export type { SearchResultRowDensity }

export type SearchResultRowProps = {
  title: string
  secondary: string
  typeLabel: string
  href: string
  campaignUnavailable?: boolean
  onActivate?: () => void
  density?: SearchResultRowDensity
  surfaceContext?: GlobalSearchSurfaceContext
  /** Parent list owns separators; rows inside shared result lists must set this. */
  borderless?: boolean
  className?: string
  viewerCharacterRelationships?: ViewerCharacterRelationships
}

export function SearchResultRow({
  title,
  secondary,
  typeLabel,
  href,
  campaignUnavailable = false,
  onActivate,
  density = 'default',
  surfaceContext = 'page',
  borderless = false,
  className,
  viewerCharacterRelationships,
}: SearchResultRowProps) {
  const relationshipLabel = viewerCharacterRelationships
    ? formatViewerCharacterRelationshipTooltip(viewerCharacterRelationships)
    : undefined

  const accessibleName = campaignUnavailable
    ? relationshipLabel
      ? `${title}, ${relationshipLabel}, ${INACTIVE_ROW_BADGE_LABEL}, ${typeLabel}`
      : `${title}, ${INACTIVE_ROW_BADGE_LABEL}, ${typeLabel}`
    : relationshipLabel
      ? `${title}, ${relationshipLabel}, ${typeLabel}`
      : `${title}, ${typeLabel}`

  return (
    <div
      className={cn(
        'group relative',
        searchResultRowVariants({ borderless, density, surfaceContext }),
        className,
      )}
    >
      <Link
        to={href}
        className="absolute inset-0 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={onActivate}
        aria-label={accessibleName}
      />
      <div className="pointer-events-none relative">
        <div className={searchResultRowHeaderVariants()}>
          <span className={searchResultRowTitleRowVariants()}>
            <Text as="span" className={searchResultRowTitleVariants()}>
              {title}
            </Text>
            {campaignUnavailable ? <InlineInactiveStatus label={INACTIVE_ROW_BADGE_LABEL} /> : null}
            <span className="pointer-events-auto relative z-10">
              <CharacterRelationshipIndicator
                viewerCharacterRelationships={viewerCharacterRelationships}
              />
            </span>
          </span>
          <Text as="span" className={searchResultRowTypeLabelVariants()}>
            {typeLabel}
          </Text>
        </div>
        {secondary ? (
          <Text as="p" variant="muted" className={searchResultRowSecondaryVariants({ density })}>
            {secondary}
          </Text>
        ) : null}
      </div>
    </div>
  )
}
