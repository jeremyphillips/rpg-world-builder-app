import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Text } from './text'
import { fieldInlineSentenceClasses } from './field.variants'

export interface InlineSentenceRowProps {
  children: ReactNode
  className?: string
  /** Associates controls with an external label when rendered inline. */
  role?: 'group'
  'aria-labelledby'?: string
}

/** Inline flex row for sentence-style field controls (choose-count, level range, dice). */
export function InlineSentenceRow({
  children,
  className,
  role,
  'aria-labelledby': ariaLabelledBy,
}: InlineSentenceRowProps) {
  return (
    <div
      className={cn(fieldInlineSentenceClasses, className)}
      role={role}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </div>
  )
}

export interface InlineSentenceConnectorProps {
  children: ReactNode
  className?: string
}

/** Static prose between inline sentence controls (`through`, `d`, …). */
export function InlineSentenceConnector({ children, className }: InlineSentenceConnectorProps) {
  return (
    <Text variant="body" className={className}>
      {children}
    </Text>
  )
}
