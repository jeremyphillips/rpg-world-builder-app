import { Link } from 'react-router-dom'

import {
  formatViewerCharacterRelationshipTooltip,
  type ViewerCharacterRelationships,
} from '@rpg/contracts'
import { Badge, ListResultItem, cn, interactiveFocusVariants } from '@rpg/ui'

import { INACTIVE_ROW_BADGE_LABEL } from '@/lib/availability'
import { CharacterRelationshipIndicator } from '@/lib/character-relationships/character-relationship-indicator'

export type SearchResultRowProps = {
  title: string
  secondary: string
  typeLabel: string
  href: string
  campaignUnavailable?: boolean
  onActivate?: () => void
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
    <ListResultItem
      name={title}
      classification={typeLabel}
      metadata={secondary || undefined}
      className={className}
      endSlot={
        campaignUnavailable ? (
          <Badge tone="neutral" appearance="outline" size="sm">
            {INACTIVE_ROW_BADGE_LABEL}
          </Badge>
        ) : undefined
      }
      trailingAction={
        viewerCharacterRelationships ? (
          <CharacterRelationshipIndicator
            viewerCharacterRelationships={viewerCharacterRelationships}
          />
        ) : undefined
      }
      asChild
    >
      <Link
        to={href}
        className={cn(interactiveFocusVariants({ context: 'standalone' }))}
        onClick={onActivate}
        aria-label={accessibleName}
      />
    </ListResultItem>
  )
}
