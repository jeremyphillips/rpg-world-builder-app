import type { MouseEvent } from 'react'
import { UserRoundCheck } from 'lucide-react'

import {
  formatViewerCharacterRelationshipTooltip,
  type ViewerCharacterRelationships,
} from '@rpg/contracts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@rpg/ui'

import { characterRelationshipIndicatorVariants } from './character-relationship-indicator.variants'

export type CharacterRelationshipIndicatorPresentation = 'standalone' | 'inlinePassive'

export type CharacterRelationshipIndicatorProps = {
  viewerCharacterRelationships?: ViewerCharacterRelationships
  /**
   * `standalone` — focusable icon with its own accessible name (name cells).
   * `inlinePassive` — decorative icon inside a navigable row; SR copy lives on the link label.
   */
  presentation?: CharacterRelationshipIndicatorPresentation
}

export function CharacterRelationshipIndicator({
  viewerCharacterRelationships,
  presentation = 'standalone',
}: CharacterRelationshipIndicatorProps) {
  if (!viewerCharacterRelationships || viewerCharacterRelationships.count === 0) {
    return null
  }

  const tooltip = formatViewerCharacterRelationshipTooltip(viewerCharacterRelationships)
  const inlinePassive = presentation === 'inlinePassive'

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild interactive={false}>
          <span
            {...(inlinePassive
              ? {
                  'aria-hidden': true,
                  tabIndex: -1,
                }
              : {
                  role: 'img',
                  'aria-label': tooltip,
                  onClick: (event: MouseEvent) => event.stopPropagation(),
                })}
            className={characterRelationshipIndicatorVariants()}
          >
            <UserRoundCheck className="size-4" aria-hidden="true" />
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
