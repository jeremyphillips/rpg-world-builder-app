'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Eyebrow } from './eyebrow'
import {
  interactiveListGroupHeadingVariants,
  type InteractiveListGroupHeadingVariantProps,
} from './interactive-list.variants'

export interface InteractiveListGroupHeadingProps extends InteractiveListGroupHeadingVariantProps {
  /** Host-owned id for `aria-labelledby` / section labelling. */
  id?: string
  children: React.ReactNode
  className?: string
  /** Visual heading element only — hosts own listbox group vs section semantics. */
  as?: 'div' | 'h2' | 'h3' | 'h4'
}

export function InteractiveListGroupHeading({
  id,
  children,
  className,
  as: Component = 'div',
  first,
  follows,
}: InteractiveListGroupHeadingProps) {
  return (
    <Component
      id={id}
      className={cn(interactiveListGroupHeadingVariants({ first, follows }), className)}
    >
      <Eyebrow size="sm">{children}</Eyebrow>
    </Component>
  )
}
