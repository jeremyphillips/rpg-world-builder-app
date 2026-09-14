'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { Eyebrow } from './eyebrow'
import {
  listResultGroupHeadingVariants,
  type ListResultGroupHeadingVariantProps,
} from './list-result.variants'

export interface ListResultGroupHeadingProps extends ListResultGroupHeadingVariantProps {
  /** Host-owned id for `aria-labelledby` / section labelling. */
  id?: string
  children: React.ReactNode
  className?: string
  /** Visual heading element only — hosts own listbox group vs section semantics. */
  as?: 'div' | 'h2' | 'h3' | 'h4'
}

export function ListResultGroupHeading({
  id,
  children,
  className,
  as: Component = 'div',
  first,
  follows,
}: ListResultGroupHeadingProps) {
  return (
    <Component
      id={id}
      className={cn(listResultGroupHeadingVariants({ first, follows }), className)}
    >
      <Eyebrow size="sm">{children}</Eyebrow>
    </Component>
  )
}
