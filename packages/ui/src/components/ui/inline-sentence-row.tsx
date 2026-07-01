import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import type { FieldSize } from './field.client'
import { fieldInlineSentenceClasses } from './field.variants'
import {
  inlineSentenceConnectorVariants,
  type InlineSentenceConnectorVariantProps,
} from './inline-sentence-row.variants'

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
  size?: FieldSize
  tone?: NonNullable<InlineSentenceConnectorVariantProps['tone']>
  'aria-hidden'?: boolean
}

/** Static prose between inline sentence controls (`through`, `d`, …). */
export function InlineSentenceConnector({
  children,
  className,
  size = 'md',
  tone = 'prose',
  'aria-hidden': ariaHidden,
}: InlineSentenceConnectorProps) {
  return (
    <span
      className={cn(inlineSentenceConnectorVariants({ size, tone }), className)}
      aria-hidden={ariaHidden}
    >
      {children}
    </span>
  )
}

export {
  inlineSentenceConnectorVariants,
  diceFormulaSeparatorVariants,
} from './inline-sentence-row.variants'
