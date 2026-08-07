'use client'

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { cn, contentCardHeadingLinkVariants } from '@rpg/ui'

import type { DrawerContextEntity } from './drawer-context.types'
import {
  drawerContextEntityHeadingNameVariants,
  drawerContextEntityHeadingSeparatorVariants,
  drawerContextEntityHeadingSuffixVariants,
  drawerContextEntityHeadingVariants,
  drawerContextEntitySupportingTextVariants,
  drawerContextEntityVariants,
} from './drawer-context.variants'

const HEADING_SUFFIX_LEADING_SEPARATOR = ' · ' as const

function splitHeadingSuffix(headingSuffix: ReactNode): {
  hasLeadingSeparator: boolean
  suffixText: ReactNode
} {
  if (
    typeof headingSuffix === 'string' &&
    headingSuffix.startsWith(HEADING_SUFFIX_LEADING_SEPARATOR)
  ) {
    return {
      hasLeadingSeparator: true,
      suffixText: headingSuffix.slice(HEADING_SUFFIX_LEADING_SEPARATOR.length),
    }
  }

  return { hasLeadingSeparator: false, suffixText: headingSuffix }
}

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
  const resolvedHeading = href ? (
    <span className={drawerContextEntityHeadingNameVariants()}>
      <Link to={href} className={contentCardHeadingLinkVariants()}>
        {heading}
      </Link>
    </span>
  ) : (
    <span className={drawerContextEntityHeadingNameVariants()}>{heading}</span>
  )

  return (
    <div className={cn(drawerContextEntityVariants(), className)}>
      <div className={drawerContextEntityHeadingVariants()}>
        {resolvedHeading}
        {headingSuffix
          ? (() => {
              const { hasLeadingSeparator, suffixText } = splitHeadingSuffix(headingSuffix)

              return (
                <>
                  {hasLeadingSeparator ? (
                    <span className={drawerContextEntityHeadingSeparatorVariants()} aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <span className={drawerContextEntityHeadingSuffixVariants()}>{suffixText}</span>
                </>
              )
            })()
          : null}
      </div>
      {supportingText ? (
        <p className={drawerContextEntitySupportingTextVariants({ size: supportingTextSize })}>
          {supportingText}
        </p>
      ) : null}
    </div>
  )
}
