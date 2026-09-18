import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@rpg/ui'
import type { ContentCardDensity } from '@rpg/ui'

import { buildEntityLeadingChromeSizeStyle } from '../../../anatomy/entity-leading-rail.lib'
import { entityCardFrameVariants, type EntityCardSurface } from './entity-card-frame.variants'

type EntityCardFrameProps = {
  density?: ContentCardDensity
  surface?: EntityCardSurface
  disabled?: boolean
  /** Occupied leading utilities (0–1) — publishes utility column size and asymmetric start inset when present. */
  leadingUtilityCount?: number
  style?: CSSProperties
  children: ReactNode
}

/** @internal Shared perimeter shell for entity card surfaces — not exported to feature consumers. */
export function EntityCardFrame({
  density = 'comfortable',
  surface = 'card',
  disabled = false,
  leadingUtilityCount = 0,
  style,
  children,
}: EntityCardFrameProps) {
  const leading = leadingUtilityCount > 0
  const leadingChromeStyle = (leading ? buildEntityLeadingChromeSizeStyle() : undefined) as
    | CSSProperties
    | undefined

  return (
    <article
      className={cn(entityCardFrameVariants({ density, surface, disabled, leading }))}
      style={{ ...leadingChromeStyle, ...style }}
      data-disabled={disabled ? true : undefined}
    >
      {children}
    </article>
  )
}
