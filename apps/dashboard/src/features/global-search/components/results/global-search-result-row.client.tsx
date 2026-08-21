'use client'

import { Link } from 'react-router-dom'

import {
  formatViewerCharacterRelationshipTooltip,
  type ViewerCharacterRelationships,
} from '@rpg/contracts'
import { cn, interactiveFocusVariants } from '@rpg/ui'

import { INACTIVE_ROW_BADGE_LABEL } from '@/lib/availability'
import { CharacterRelationshipIndicator } from '@/lib/character-relationships/character-relationship-indicator.client'
import { EntityAnatomyHost } from '@/features/content'

import type { GlobalSearchSurfaceContext } from '../../lib/global-search-surface.variants'
import {
  searchResultRowVariants,
  type SearchResultRowDensity,
} from './global-search-result-row.variants'

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
        className={cn(
          'absolute inset-0 rounded-[inherit]',
          interactiveFocusVariants({ context: 'standalone' }),
        )}
        onClick={onActivate}
        aria-label={accessibleName}
      />
      <div className="pointer-events-none relative">
        <EntityAnatomyHost
          density={density === 'compact' ? 'compact' : 'comfortable'}
          entity={{
            heading: title,
            classification: typeLabel,
            description: secondary || undefined,
            status: campaignUnavailable
              ? [{ kind: 'inactive', label: INACTIVE_ROW_BADGE_LABEL }]
              : undefined,
          }}
          trailing={
            viewerCharacterRelationships
              ? {
                  kind: 'action',
                  content: (
                    <span className="pointer-events-auto relative z-10">
                      <CharacterRelationshipIndicator
                        viewerCharacterRelationships={viewerCharacterRelationships}
                      />
                    </span>
                  ),
                }
              : undefined
          }
        />
      </div>
    </div>
  )
}
