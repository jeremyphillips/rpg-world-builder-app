import { UserRoundCheck } from 'lucide-react'

import {
  formatViewerCharacterRelationshipTooltip,
  type ViewerCharacterRelationships,
} from '@rpg/contracts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@rpg/ui'

import { characterRelationshipIndicatorVariants } from './character-relationship-indicator.variants'

export type CharacterRelationshipIndicatorProps = {
  viewerCharacterRelationships?: ViewerCharacterRelationships
}

export function CharacterRelationshipIndicator({
  viewerCharacterRelationships,
}: CharacterRelationshipIndicatorProps) {
  if (!viewerCharacterRelationships || viewerCharacterRelationships.count === 0) {
    return null
  }

  const tooltip = formatViewerCharacterRelationshipTooltip(viewerCharacterRelationships)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="img"
            aria-label={tooltip}
            className={characterRelationshipIndicatorVariants()}
            onClick={(event) => event.stopPropagation()}
          >
            <UserRoundCheck className="size-4" aria-hidden="true" />
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
