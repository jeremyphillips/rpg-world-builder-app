'use client'

import type { ReactElement, ReactNode } from 'react'
import {
  cardSurfaceVariants,
  cn,
  interactiveFocusVariants,
  NavigationChevron,
  renderNavigableLinkRoot,
} from '@rpg/ui'
import type { ContentCardDensity } from '@rpg/ui'

import {
  ENTITY_SURFACE_DEFAULT_EDGES,
  type EntitySurfaceEdges,
} from '../../../anatomy/entity-surface-edges.lib'
import { entityCardFrameClassName } from './entity-card-frame.lib'

const UI_CARD_NAV_CLASS = 'ui-card__nav' as const
const UI_CARD_NAV_MAIN_CLASS = 'ui-card__nav-main' as const
const UI_CARD_NAV_CHEVRON_CLASS = 'ui-card__nav-chevron' as const

type EntityCardFrameProps = {
  density?: ContentCardDensity
  interactive?: boolean
  selected?: boolean
  disabled?: boolean
  edges?: EntitySurfaceEdges
  leadingUtilityCount?: number
  link?: ReactElement
  showNavigationChevron?: boolean
  children: ReactNode
}

function resolveFrameClassName({
  density,
  interactive,
  selected,
  disabled,
  edges,
  leadingUtilityCount,
  navigable,
}: {
  density: ContentCardDensity
  interactive: boolean
  selected: boolean
  disabled: boolean
  edges: EntitySurfaceEdges
  leadingUtilityCount: number
  navigable: boolean
}): string {
  return cn(
    cardSurfaceVariants({ tone: 'quiet', density, interactive, selected, disabled }),
    entityCardFrameClassName({ density, edges, leadingUtilityCount }),
    navigable &&
      cn('block w-full min-w-0 no-underline', interactiveFocusVariants({ context: 'standalone' })),
  )
}

function frameDataAttributes({
  density,
  disabled,
  edges,
}: {
  density: ContentCardDensity
  disabled: boolean
  edges: EntitySurfaceEdges
}) {
  return {
    'data-content-density': density,
    'data-disabled': disabled ? true : undefined,
    'data-entity-surface-start': edges.start,
    'data-entity-surface-end': edges.end,
  }
}

/** @internal Shared perimeter shell for entity card surfaces — not exported to feature consumers. */
export function EntityCardFrame({
  density = 'comfortable',
  interactive = false,
  selected = false,
  disabled = false,
  edges = ENTITY_SURFACE_DEFAULT_EDGES,
  leadingUtilityCount = 0,
  link,
  showNavigationChevron = true,
  children,
}: EntityCardFrameProps) {
  const navigable = link != null
  const resolvedInteractive = navigable ? true : interactive
  const className = resolveFrameClassName({
    density,
    interactive: resolvedInteractive,
    selected,
    disabled,
    edges,
    leadingUtilityCount,
    navigable,
  })
  const dataProps = frameDataAttributes({ density, disabled, edges })

  if (navigable) {
    const interior = (
      <div className={UI_CARD_NAV_CLASS}>
        <div className={cn(UI_CARD_NAV_MAIN_CLASS, 'min-w-0 flex-1')}>{children}</div>
        {showNavigationChevron ? <NavigationChevron className={UI_CARD_NAV_CHEVRON_CLASS} /> : null}
      </div>
    )
    return renderNavigableLinkRoot(link, className, interior, dataProps, null)
  }

  return (
    <article className={className} {...dataProps}>
      {children}
    </article>
  )
}
