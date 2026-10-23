'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '../../lib/utils'
import { resolveCompactControlRecipeClasses } from './compact-control.styles'

export type ContentCardHeadingActionProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean
}

/** Canonical compact inline action chrome for heading-row links and buttons. */
export function ContentCardHeadingAction({
  asChild = false,
  className,
  ...props
}: ContentCardHeadingActionProps) {
  const resolvedClassName = cn(
    'inline-flex shrink-0 items-center rounded-sm pl-2 pr-0 text-sm text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    resolveCompactControlRecipeClasses('text-compact', { includeBlock: false }),
    className,
  )
  const Comp = asChild ? Slot : 'span'

  return <Comp className={resolvedClassName} data-content-card-heading-action="" {...props} />
}
