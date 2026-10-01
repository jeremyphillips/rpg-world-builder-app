'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import {
  interactiveListToolbarFilterRowVariants,
  interactiveListToolbarSearchRowVariants,
  interactiveListToolbarVariants,
} from './interactive-list.variants'

export interface InteractiveListToolbarProps {
  /** Search control row — hosts own input state and ARIA. */
  search: React.ReactNode
  /** Optional filter row rendered below search — hosts own filter UI and state. */
  filter?: React.ReactNode
  className?: string
}

export function InteractiveListToolbar({ search, filter, className }: InteractiveListToolbarProps) {
  return (
    <div className={cn(interactiveListToolbarVariants(), className)}>
      <div className={interactiveListToolbarSearchRowVariants()}>{search}</div>
      {filter ? <div className={interactiveListToolbarFilterRowVariants()}>{filter}</div> : null}
    </div>
  )
}
