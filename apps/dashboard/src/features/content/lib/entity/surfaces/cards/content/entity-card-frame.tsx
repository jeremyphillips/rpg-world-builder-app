import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@rpg/ui'
import type { ContentCardDensity } from '@rpg/ui'

import { buildEntityLeadingChromeSizeStyle } from '../../../anatomy/entity-leading-rail.lib'
import { entityCardFrameVariants } from './entity-card-frame.variants'

type EntityCardFrameProps = {
  density?: ContentCardDensity
  disabled?: boolean
  /** Occupied leading utilities (0–1) — publishes utility column size when present. */
  leadingUtilityCount?: number
  children: ReactNode
}

/** @internal Shared bordered shell for entity card surfaces — not exported to feature consumers. */
export function EntityCardFrame({
  density = 'comfortable',
  disabled = false,
  leadingUtilityCount = 0,
  children,
}: EntityCardFrameProps) {
  const leadingChromeStyle = (
    leadingUtilityCount > 0 ? buildEntityLeadingChromeSizeStyle() : undefined
  ) as CSSProperties | undefined

  return (
    <article
      className={cn(
        entityCardFrameVariants({ density, disabled, leading: leadingUtilityCount > 0 }),
      )}
      style={leadingChromeStyle}
      data-disabled={disabled ? true : undefined}
    >
      {children}
    </article>
  )
}
