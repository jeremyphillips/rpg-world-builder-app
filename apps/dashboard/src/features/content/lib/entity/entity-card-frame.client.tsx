'use client'

import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@rpg/ui'
import type { ContentCardDensity } from '@rpg/ui'

import { buildEntityLeadingOffsetStyle } from './entity-leading-rail.lib'
import { entityCardFrameVariants } from './entity-card-frame.variants'

type EntityCardFrameProps = {
  density?: ContentCardDensity
  disabled?: boolean
  /** Occupied leading utilities (0–1) — publishes `--entity-leading-offset` on the shell. */
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
  const leadingOffsetStyle = buildEntityLeadingOffsetStyle(leadingUtilityCount) as CSSProperties

  return (
    <article
      className={cn(entityCardFrameVariants({ density, disabled }))}
      style={leadingOffsetStyle}
      data-disabled={disabled ? true : undefined}
    >
      {children}
    </article>
  )
}
