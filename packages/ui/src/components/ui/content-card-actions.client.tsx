'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '../../lib/utils'
import {
  contentCardHeadingActionVariants,
  contentCardIconActionVariants,
} from './content-card.variants'

export type ContentCardIconActionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
}

export function ContentCardIconAction({
  asChild = false,
  className,
  type = 'button',
  ...props
}: ContentCardIconActionProps) {
  const resolvedClassName = cn(contentCardIconActionVariants(), className)
  const Comp = asChild ? Slot : 'button'

  return <Comp className={resolvedClassName} type={asChild ? undefined : type} {...props} />
}

export type ContentCardHeadingActionProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean
}

/** Canonical compact inline action chrome for heading-row links and buttons. */
export function ContentCardHeadingAction({
  asChild = false,
  className,
  ...props
}: ContentCardHeadingActionProps) {
  const resolvedClassName = cn(contentCardHeadingActionVariants(), className)
  const Comp = asChild ? Slot : 'span'

  return <Comp className={resolvedClassName} data-content-card-heading-action="" {...props} />
}
