import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@rpg/ui'
import type { ContentCardDensity } from '@rpg/ui'

import { buildEntityLeadingChromeSizeStyle } from '../../../anatomy/entity-leading-rail.lib'
import {
  ENTITY_SURFACE_DEFAULT_EDGES,
  type EntitySurfaceEdges,
} from '../../../anatomy/entity-surface-edges.lib'
import { entityCardFrameVariants, type EntityCardSurface } from './entity-card-frame.variants'

type EntityCardFrameProps = {
  density?: ContentCardDensity
  surface?: EntityCardSurface
  disabled?: boolean
  /** From `resolveEntitySurfaceEdges` — utility edges tighten the start/end inset. */
  edges?: EntitySurfaceEdges
  style?: CSSProperties
  children: ReactNode
}

/** @internal Shared perimeter shell for entity card surfaces — not exported to feature consumers. */
export function EntityCardFrame({
  density = 'comfortable',
  surface = 'card',
  disabled = false,
  edges = ENTITY_SURFACE_DEFAULT_EDGES,
  style,
  children,
}: EntityCardFrameProps) {
  const leadingChromeStyle = (
    edges.start === 'utility' ? buildEntityLeadingChromeSizeStyle() : undefined
  ) as CSSProperties | undefined

  return (
    <article
      className={cn(entityCardFrameVariants({ density, surface, disabled, edges }))}
      style={{ ...leadingChromeStyle, ...style }}
      data-disabled={disabled ? true : undefined}
      data-entity-surface-start={edges.start}
      data-entity-surface-end={edges.end}
    >
      {children}
    </article>
  )
}
