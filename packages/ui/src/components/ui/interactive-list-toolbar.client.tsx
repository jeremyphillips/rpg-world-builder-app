'use client'

import * as React from 'react'

import { cn } from '../../lib/utils'
import { borderStrength } from './border-strength'

export interface InteractiveListToolbarProps {
  /** Search control row — hosts own input state and ARIA. */
  search: React.ReactNode
  /** Optional filter row rendered below search — hosts own filter UI and state. */
  filter?: React.ReactNode
  className?: string
}

export function InteractiveListToolbar({ search, filter, className }: InteractiveListToolbarProps) {
  return (
    <div className={cn('ui-interactive-list__toolbar', borderStrength(), className)}>
      <div className="ui-interactive-list__toolbar-search">{search}</div>
      {filter ? (
        <div className={cn('ui-interactive-list__toolbar-filter', borderStrength())}>{filter}</div>
      ) : null}
    </div>
  )
}
