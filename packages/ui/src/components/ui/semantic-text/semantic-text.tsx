import * as React from 'react'

import { cn } from '../../../lib/utils'
import {
  semanticTextVariants,
  type SemanticTextEmphasis,
  type SemanticTextTone,
} from './semantic-text.variants'
import { inlineIconFlexSlotClasses } from '../icon-glyph.variants'

export type { SemanticTextEmphasis, SemanticTextTone } from './semantic-text.variants'
export { semanticTextVariants } from './semantic-text.variants'

export type SemanticTextProps = {
  tone?: SemanticTextTone
  emphasis?: SemanticTextEmphasis
  /** Caller supplies the icon node. The slot inherits its step from this text owner. */
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

/** Inline semantic copy — always renders a `span`. */
export function SemanticText({ tone, emphasis, icon, children, className }: SemanticTextProps) {
  return (
    <span
      className={cn(
        semanticTextVariants({ tone, emphasis }),
        icon ? 'items-start gap-2' : undefined,
        className,
      )}
    >
      {icon ? (
        <span aria-hidden="true" className={inlineIconFlexSlotClasses}>
          {icon}
        </span>
      ) : null}
      {children}
    </span>
  )
}
