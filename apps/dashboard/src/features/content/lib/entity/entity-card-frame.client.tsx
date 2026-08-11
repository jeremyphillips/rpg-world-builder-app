'use client'

import type { ReactNode } from 'react'
import { cn } from '@rpg/ui'
import type { ContentCardDensity } from '@rpg/ui'

import { entityCardFrameVariants } from './entity-card-frame.variants'

type EntityCardFrameProps = {
  density?: ContentCardDensity
  disabled?: boolean
  children: ReactNode
}

/** @internal Shared bordered shell for entity card surfaces — not exported to feature consumers. */
export function EntityCardFrame({
  density = 'comfortable',
  disabled = false,
  children,
}: EntityCardFrameProps) {
  return (
    <article
      className={cn(entityCardFrameVariants({ density, disabled }))}
      data-disabled={disabled ? true : undefined}
    >
      {children}
    </article>
  )
}
