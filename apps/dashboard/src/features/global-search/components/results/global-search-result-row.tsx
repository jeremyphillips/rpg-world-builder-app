import { Link } from 'react-router-dom'

import {
  formatViewerCharacterRelationshipTooltip,
  resolveContentDisplayFallbackForSearchTarget,
  type GlobalSearchDocument,
  type ViewerCharacterRelationships,
} from '@rpg/contracts'
import { ListResultItem, cn, interactiveFocusVariants } from '@rpg/ui'

import { EntityAnatomyHost, projectEntitySurfaceIdentityToSummaryModel } from '@/features/content'
import { INACTIVE_ROW_BADGE_LABEL } from '@/lib/availability'
import { CharacterRelationshipIndicator } from '@/lib/character-relationships/character-relationship-indicator'

import { wireGlobalSearchDisplayImage } from '../../lib/wire-global-search-display-image.lib'

export type SearchResultRowProps = {
  document: GlobalSearchDocument
  href: string
  campaignUnavailable?: boolean
  onActivate?: () => void
  className?: string
  viewerCharacterRelationships?: ViewerCharacterRelationships
}

export function SearchResultRow({
  document,
  href,
  campaignUnavailable = false,
  onActivate,
  className,
  viewerCharacterRelationships,
}: SearchResultRowProps) {
  const { title, secondary, typeLabel, target, displayImage } = document

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

  const wiredDisplayImage = wireGlobalSearchDisplayImage(displayImage)

  const entity = projectEntitySurfaceIdentityToSummaryModel(
    {
      heading: title,
      classification: typeLabel,
      ...(secondary ? { metadata: secondary } : {}),
      fallback: resolveContentDisplayFallbackForSearchTarget(target),
      ...(wiredDisplayImage ? { displayImage: wiredDisplayImage } : {}),
      ...(campaignUnavailable
        ? { status: [{ kind: 'inactive', label: INACTIVE_ROW_BADGE_LABEL }] }
        : {}),
    },
    'compact',
  )

  return (
    <ListResultItem
      content={<EntityAnatomyHost density="compact" entity={entity} />}
      className={className}
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
