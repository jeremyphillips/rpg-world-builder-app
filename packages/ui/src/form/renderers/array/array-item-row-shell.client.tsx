'use client'

import * as React from 'react'

import { cn } from '../../../lib/utils'
import { ArrayItemShell, type ArrayItemShellProps } from './array-item-shell.client'

export type ArrayItemRowShellProps = Omit<
  ArrayItemShellProps,
  'showDragHandle' | 'collapsible' | 'layout' | 'main'
> & {
  children: React.ReactNode
}

/** Compact-row shell for custom array item composition. */
export function ArrayItemRowShell({ children, className, ...props }: ArrayItemRowShellProps) {
  return (
    <ArrayItemShell
      {...props}
      showDragHandle={false}
      collapsible={false}
      layout="compactRow"
      className={cn(className)}
      main={children}
    />
  )
}
