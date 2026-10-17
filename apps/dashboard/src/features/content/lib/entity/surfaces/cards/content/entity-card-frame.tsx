'use client'

import type { CSSProperties, ReactNode } from 'react'
import { cardSurfaceVariants, cn, useCardSurfaceTone } from '@rpg/ui'
import type { ContentCardDensity } from '@rpg/ui'

import {
  ENTITY_SURFACE_DEFAULT_EDGES,
  type EntitySurfaceEdges,
} from '../../../anatomy/entity-surface-edges.lib'
import { entityCardFrameVariants } from './entity-card-frame.variants'

type EntityCardFrameProps = {
  density?: ContentCardDensity
  interactive?: boolean
  selected?: boolean
  disabled?: boolean
  edges?: EntitySurfaceEdges
  style?: CSSProperties
  children: ReactNode
}

/** @internal Shared perimeter shell for entity card surfaces — not exported to feature consumers. */
export function EntityCardFrame({
  density = 'comfortable',
  interactive = false,
  selected = false,
  disabled = false,
  edges = ENTITY_SURFACE_DEFAULT_EDGES,
  style,
  children,
}: EntityCardFrameProps) {
  const tone = useCardSurfaceTone('quiet')

  return (
    <article
      className={cn(
        cardSurfaceVariants({ tone, interactive, selected, disabled }),
        entityCardFrameVariants({ density, edges }),
      )}
      style={style}
      data-content-density={density}
      data-disabled={disabled ? true : undefined}
      data-entity-surface-start={edges.start}
      data-entity-surface-end={edges.end}
    >
      {children}
    </article>
  )
}
