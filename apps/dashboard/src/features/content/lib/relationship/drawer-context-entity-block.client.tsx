'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn, ContentCardHeading, contentCardHeadingLinkVariants } from '@rpg/ui'

import type { DrawerContextEntity } from './drawer-context.types'
import {
  drawerContextEntitySupportingTextVariants,
  drawerContextEntityVariants,
} from './drawer-context.variants'

export type DrawerContextEntityBlockProps = DrawerContextEntity & {
  className?: string
  supportingTextSize?: 'sm' | 'xs'
}

export function DrawerContextEntityBlock({
  heading,
  headingSuffix,
  supportingText,
  href,
  className,
  supportingTextSize,
}: DrawerContextEntityBlockProps) {
  const resolvedHeading: ReactNode = href ? (
    <Link to={href} className={contentCardHeadingLinkVariants()}>
      {heading}
    </Link>
  ) : (
    heading
  )

  return (
    <div className={cn(drawerContextEntityVariants(), className)}>
      <ContentCardHeading
        heading={resolvedHeading}
        headingSuffix={headingSuffix}
        density="compact"
      />
      {supportingText ? (
        <p className={drawerContextEntitySupportingTextVariants({ size: supportingTextSize })}>
          {supportingText}
        </p>
      ) : null}
    </div>
  )
}
