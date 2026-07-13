import * as React from 'react'

import { cn } from '../../lib/utils'

export interface ChipGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Opt-in only — omit when a parent fieldset/legend already provides semantics. */
  semanticRole?: 'group' | 'radiogroup'
}

export function ChipGroup({ children, className, semanticRole, ...props }: ChipGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)} role={semanticRole} {...props}>
      {children}
    </div>
  )
}
