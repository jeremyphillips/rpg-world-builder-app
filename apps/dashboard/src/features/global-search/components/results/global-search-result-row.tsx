import { Link } from 'react-router-dom'

import {
  formatViewerCharacterRelationshipTooltip,
  resolveContentDisplayFallbackForSearchTarget,
  type GlobalSearchDocument,
  type ViewerCharacterRelationships,
} from '@rpg/contracts'
import { DestinationItem, IdentityRow } from '@rpg/ui'

import {
  entitySurfaceMetadataFromText,
  projectSearchHitToInteractiveListPresentation,
} from '@/features/content'
import { INACTIVE_ROW_BADGE_LABEL } from '@/lib/availability'
import { CharacterRelationshipIndicator } from '@/lib/character-relationships/character-relationship-indicator'

import { wireGlobalSearchDisplayImage } from '../../lib/wire-global-search-display-image.lib'

export type SearchResultRowProps = {
  document: GlobalSearchDocument
  href: string
  campaignUnavailable?: boolean
  onActivate?: () => void
  viewerCharacterRelationships?: ViewerCharacterRelationships
}

export function SearchResultRow({
  document,
  href,
  campaignUnavailable = false,
  onActivate,
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

  const presentation = projectSearchHitToInteractiveListPresentation({
    heading: title,
    classification: typeLabel,
    ...(secondary ? { metadata: entitySurfaceMetadataFromText(secondary) } : {}),
    fallback: resolveContentDisplayFallbackForSearchTarget(target),
    ...(wiredDisplayImage ? { displayImage: wiredDisplayImage } : {}),
    ...(campaignUnavailable
      ? { status: [{ kind: 'inactive', label: INACTIVE_ROW_BADGE_LABEL }] }
      : {}),
  })

  return (
    <DestinationItem
      link={<Link to={href} onClick={onActivate} aria-label={accessibleName} />}
      startSlot={presentation.startSlot}
      content={
        <IdentityRow
          heading={presentation.heading}
          classification={presentation.classification}
          supporting={presentation.supporting}
          status={presentation.status}
        />
      }
      trailingInfo={
        viewerCharacterRelationships ? (
          <CharacterRelationshipIndicator
            presentation="inlinePassive"
            viewerCharacterRelationships={viewerCharacterRelationships}
          />
        ) : undefined
      }
    />
  )
}
